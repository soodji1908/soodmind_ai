#!/usr/bin/env node
import { connectDB } from '../lib/mongodb';
import { User, UserRole } from '../lib/models';
import { hashPassword } from '../lib/services/auth';

async function seedAdmin() {
  const email = process.env.SEED_ADMIN_EMAIL ?? 'admin@estatemind.ai';
  const password = process.env.SEED_ADMIN_PASSWORD ?? 'ChangeMeNow123!';

  await connectDB();

  const existing = await User.findOne({ email });
  if (existing) {
    const alreadyAdmin = await UserRole.findOne({ userId: existing._id, role: 'super_admin' });
    if (alreadyAdmin) {
      console.log('Super Admin already exists:', email);
      process.exit(0);
    }
    await UserRole.create({ userId: existing._id, role: 'super_admin' });
    console.log('Granted super_admin to existing user:', email);
    process.exit(0);
  }

  const passwordHash = await hashPassword(password);
  const user = await User.create({
    email,
    passwordHash,
    fullName: 'Super Administrator',
    emailVerified: true,
    isActive: true,
  });

  await UserRole.create({ userId: user._id, role: 'super_admin' });
  console.log('Super Admin created:', email);
  process.exit(0);
}

seedAdmin().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
