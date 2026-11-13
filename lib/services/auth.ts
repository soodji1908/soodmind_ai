import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createHash, randomBytes } from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' ? '' : 'estatemind-local-development-secret-change-before-deploying');

function getJwtSecret(): string {
  if (!JWT_SECRET) throw new Error('JWT_SECRET is required in production. Add a strong random secret to your environment variables.');
  return JWT_SECRET;
}
const SESSION_COOKIE_NAME = 'em_session';
const SESSION_EXPIRY_DAYS = 7;
const BCRYPT_ROUNDS = 12;

export type SessionPayload = {
  userId: string;
  email: string;
  portal: string;
  tokenHash: string;
};

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
}

export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export function createSessionToken(payload: Omit<SessionPayload, 'tokenHash'> & { tokenHash: string }): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: `${SESSION_EXPIRY_DAYS}d` });
}

export function verifySessionToken(token: string): SessionPayload | null {
  try {
    const decoded = jwt.verify(token, getJwtSecret()) as SessionPayload;
    return decoded;
  } catch {
    return null;
  }
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function generateResetToken(): string {
  return randomBytes(32).toString('hex');
}

export function generateVerifyToken(): string {
  return randomBytes(32).toString('hex');
}

export const SESSION_COOKIE = SESSION_COOKIE_NAME;
export const SESSION_EXPIRY_MS = SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: SESSION_EXPIRY_MS,
};
