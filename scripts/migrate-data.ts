#!/usr/bin/env node
import { connectDB } from '../lib/mongodb';
import { User, PortalMembership, UserRole, LoginActivity } from '../lib/models';
import { hashPassword } from '../lib/services/auth';

async function migrateData() {
  console.log('This script migrates existing Supabase users to MongoDB.');
  console.log('Since Supabase password hashes are not accessible, users will need to reset their passwords.\n');

  await connectDB();

  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.log('No Supabase credentials found. If you have users to migrate,');
    console.log('set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_ANON_KEY, then re-run.');
    console.log('\nAlternatively, provide user data as JSON via stdin:');
    console.log('  echo \'[{"email":"user@example.com","full_name":"John","portal":"estate","role":"buyer"}]\' | npm run migrate:data');
    return;
  }

  console.log('Fetching users from Supabase...');
  const response = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=id,email,full_name`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
  });

  if (!response.ok) {
    console.error('Failed to fetch profiles:', response.status);
    process.exit(1);
  }

  const profiles = await response.json() as Array<{ id: string; email: string; full_name: string }>;
  console.log(`Found ${profiles.length} profiles.\n`);

  const membershipsResponse = await fetch(`${SUPABASE_URL}/rest/v1/portal_memberships?select=user_id,portal,role,status`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
  });

  const memberships = membershipsResponse.ok
    ? await membershipsResponse.json() as Array<{ user_id: string; portal: string; role: string; status: string }>
    : [];

  let migrated = 0;
  for (const profile of profiles) {
    const existing = await User.findOne({ email: profile.email.toLowerCase() });
    if (existing) {
      console.log(`  Skip (already exists): ${profile.email}`);
      continue;
    }

    const tempPassword = Math.random().toString(36).slice(2) + 'A1!';
    const passwordHash = await hashPassword(tempPassword);

    const user = await User.create({
      email: profile.email.toLowerCase(),
      passwordHash,
      fullName: profile.full_name ?? '',
      emailVerified: true,
      isActive: true,
    });

    const userMemberships = memberships.filter((m) => m.user_id === profile.id);
    for (const m of userMemberships) {
      await PortalMembership.create({
        userId: user._id,
        portal: m.portal,
        role: m.role,
        status: m.status as 'active' | 'suspended',
      });
    }

    console.log(`  Migrated: ${profile.email} (${userMemberships.length} memberships) — temporary password set, user must reset`);
    migrated++;
  }

  console.log(`\nMigration complete. ${migrated} users migrated.`);
  console.log('All migrated users have temporary passwords and must use the forgot-password flow.');
  process.exit(0);
}

migrateData().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
