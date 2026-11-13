import { connectDB } from '@/lib/mongodb';
import { User, UserRole, PortalMembership, PORTAL_ROLES, type PortalKey } from '@/lib/models';
import { hashPassword, verifyPassword, generateResetToken, generateVerifyToken, hashToken } from './auth';
import { createSessionRecord, destroySessionRecord } from './session';
import { createSessionToken } from './auth';
import { Session } from '@/lib/models';

const RESET_EXPIRY_HOURS = 1;
const VERIFY_EXPIRY_HOURS = 24;

export type SignupInput = {
  email: string;
  password: string;
  fullName: string;
  portal: PortalKey;
  role: string;
};

export type SignupResult =
  | { ok: true; userId: string; token: string }
  | { ok: false; error: string; message: string };

export async function registerUser(input: SignupInput): Promise<SignupResult> {
  await connectDB();

  const email = input.email.trim().toLowerCase();
  const fullName = input.fullName.trim().slice(0, 120);

  if (fullName.length < 2) {
    return { ok: false, error: 'invalid_name', message: 'Enter your full name.' };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: 'invalid_email', message: 'Enter a valid email address.' };
  }
  if (input.password.length < 8) {
    return { ok: false, error: 'weak_password', message: 'Use at least 8 characters for your password.' };
  }

  const allowedRoles = PORTAL_ROLES[input.portal] ?? [];
  if (!allowedRoles.includes(input.role)) {
    return { ok: false, error: 'invalid_role', message: 'Choose a valid role for this portal.' };
  }

  const existing = await User.findOne({ email });
  if (existing) {
    return { ok: false, error: 'email_exists', message: 'An account with this email already exists. Sign in instead.' };
  }

  const passwordHash = await hashPassword(input.password);
  const verifyToken = generateVerifyToken();
  const verifyExpires = new Date(Date.now() + VERIFY_EXPIRY_HOURS * 60 * 60 * 1000);

  let user: Awaited<ReturnType<typeof User.create>> | undefined;
  try {
    user = await User.create({
      email,
      passwordHash,
      fullName,
      emailVerified: false,
      emailVerifyToken: verifyToken,
      emailVerifyExpires: verifyExpires,
      isActive: true,
    });

    if (input.portal === 'admin') {
      await UserRole.create({ userId: user._id, role: 'super_admin' });
    } else {
      await PortalMembership.create({
        userId: user._id,
        portal: input.portal,
        role: input.role,
        status: 'active',
      });
    }
  } catch (error) {
    // Prevent a half-created account if membership creation fails.
    if (user?._id) await User.deleteOne({ _id: user._id }).catch(() => undefined);
    if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
      return { ok: false, error: 'email_exists', message: 'An account with this email already exists. Sign in instead.' };
    }
    throw error;
  }

  if (!user) {
    return { ok: false, error: 'signup_failed', message: 'Account creation failed. Please try again.' };
  }

  const token = createSessionToken({
    userId: user._id.toString(),
    email: user.email,
    portal: input.portal,
    tokenHash: '',
  });

  return { ok: true, userId: user._id.toString(), token };
}

export type LoginResult =
  | { ok: true; userId: string; email: string; token: string; portal: string }
  | { ok: false; error: string; message: string };

export async function loginUser(
  email: string,
  password: string,
  portal: PortalKey,
  userAgent?: string,
): Promise<LoginResult> {
  await connectDB();

  const normalizedEmail = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return { ok: false, error: 'invalid_email', message: 'Enter a valid email address.' };
  }
  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    return { ok: false, error: 'invalid_credentials', message: 'The email address or password is incorrect.' };
  }

  if (!user.isActive) {
    return { ok: false, error: 'account_deactivated', message: 'This account has been deactivated.' };
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return { ok: false, error: 'invalid_credentials', message: 'The email address or password is incorrect.' };
  }

  if (portal === 'admin') {
    const adminRole = await UserRole.findOne({ userId: user._id, role: 'super_admin' });
    if (!adminRole) {
      return { ok: false, error: 'no_access', message: 'This account does not have Super Administrator access.' };
    }
  } else {
    const membership = await PortalMembership.findOne({
      userId: user._id,
      portal,
      status: 'active',
    });
    if (!membership) {
      return {
        ok: false,
        error: 'no_access',
        message: `This account does not have access to this portal. Sign in with the portal you registered for.`,
      };
    }
  }

  const rawToken = createSessionToken({
    userId: user._id.toString(),
    email: user.email,
    portal,
    tokenHash: '',
  });

  await createSessionRecord(user._id.toString(), portal, rawToken, userAgent);

  return {
    ok: true,
    userId: user._id.toString(),
    email: user.email,
    token: rawToken,
    portal,
  };
}

export async function logoutUser(token: string): Promise<void> {
  await destroySessionRecord(token);
}

export async function requestPasswordReset(email: string): Promise<{ token: string | null; userId: string | null }> {
  await connectDB();
  const normalizedEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });
  if (!user || !user.isActive) return { token: null, userId: null };

  const token = generateResetToken();
  const expires = new Date(Date.now() + RESET_EXPIRY_HOURS * 60 * 60 * 1000);

  user.passwordResetToken = token;
  user.passwordResetExpires = expires;
  await user.save();

  return { token, userId: user._id.toString() };
}

export async function resetPassword(token: string, newPassword: string): Promise<{ ok: boolean; error?: string }> {
  await connectDB();

  if (newPassword.length < 8) {
    return { ok: false, error: 'Password must be at least 8 characters.' };
  }

  const user = await User.findOne({
    passwordResetToken: token,
    passwordResetExpires: { $gt: new Date() },
  }).select('+passwordResetToken +passwordResetExpires');

  if (!user) {
    return { ok: false, error: 'This reset link is invalid or has expired.' };
  }

  user.passwordHash = await hashPassword(newPassword);
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  return { ok: true };
}

export async function verifyEmail(token: string): Promise<{ ok: boolean; error?: string }> {
  await connectDB();
  const user = await User.findOne({
    emailVerifyToken: token,
    emailVerifyExpires: { $gt: new Date() },
  }).select('+emailVerifyToken +emailVerifyExpires');

  if (!user) {
    return { ok: false, error: 'This verification link is invalid or has expired.' };
  }

  user.emailVerified = true;
  user.emailVerifyToken = undefined;
  user.emailVerifyExpires = undefined;
  await user.save();

  return { ok: true };
}

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
): Promise<{ ok: boolean; error?: string }> {
  await connectDB();
  const user = await User.findById(userId);
  if (!user) return { ok: false, error: 'User not found.' };

  const valid = await verifyPassword(currentPassword, user.passwordHash);
  if (!valid) return { ok: false, error: 'Your current password is incorrect.' };

  if (newPassword.length < 8) {
    return { ok: false, error: 'New password must be at least 8 characters.' };
  }

  user.passwordHash = await hashPassword(newPassword);
  await user.save();
  return { ok: true };
}

export async function deactivateAccount(userId: string): Promise<{ ok: boolean }> {
  await connectDB();
  await User.findByIdAndUpdate(userId, { isActive: false });
  await Session.deleteMany({ userId });
  return { ok: true };
}
