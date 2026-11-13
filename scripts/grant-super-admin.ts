#!/usr/bin/env node
import { loadEnvConfig } from '@next/env';
import mongoose from 'mongoose';

async function grantOwnerSuperAdmin() {
  // Load .env.local before importing the DB module, which reads env at module initialization.
  loadEnvConfig(process.cwd());
  const email = (process.env.OWNER_ADMIN_EMAIL ?? '').trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('Set OWNER_ADMIN_EMAIL to the existing owner account email before running this script.');
  }

  const { connectDB } = await import('../lib/mongodb');
  const { User, UserRole } = await import('../lib/models');
  await connectDB();

  const user = await User.findOne({ email }).select('_id email fullName isActive');
  if (!user) {
    throw new Error(`No existing account found for ${email}. Sign up first; this script never creates users.`);
  }
  if (!user.isActive) {
    throw new Error(`The account ${email} is inactive. Activate it through the normal account administration process first.`);
  }

  const result = await UserRole.findOneAndUpdate(
    { userId: user._id, role: 'super_admin' },
    { $setOnInsert: { userId: user._id, role: 'super_admin', grantedAt: new Date() } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  console.log(`Super Administrator access confirmed for ${user.email} (${user.fullName || 'Unnamed user'}).`);
  console.log(result ? 'UserRole record is present in the configured MongoDB database.' : 'No changes were required.');
}

grantOwnerSuperAdmin()
  .catch((error) => {
    console.error('Could not grant Super Administrator access:', error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect().catch(() => undefined);
  });
