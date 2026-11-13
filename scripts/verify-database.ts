#!/usr/bin/env node
import { connectDB } from '../lib/mongodb';
import {
  User, UserRole, PortalMembership, Session, LoginActivity,
  Notification, AuditLog, PlatformSettings, Property, Resume,
} from '../lib/models';

async function verifyDatabase() {
  console.log('Connecting to MongoDB...');
  await connectDB();
  console.log('Connected.\n');

  const checks = [
    { name: 'users', model: User },
    { name: 'user_roles', model: UserRole },
    { name: 'portal_memberships', model: PortalMembership },
    { name: 'sessions', model: Session },
    { name: 'login_activity', model: LoginActivity },
    { name: 'notifications', model: Notification },
    { name: 'audit_logs', model: AuditLog },
    { name: 'platform_settings', model: PlatformSettings },
    { name: 'properties', model: Property },
    { name: 'resumes', model: Resume },
  ];

  let allOk = true;
  for (const check of checks) {
    const count = await check.model.countDocuments();
    const status = count >= 0 ? 'OK' : 'FAIL';
    if (status === 'FAIL') allOk = false;
    console.log(`  [${status}] ${check.name}: ${count} documents`);
  }

  const adminCount = await UserRole.countDocuments({ role: 'super_admin' });
  console.log(`\nSuper admins: ${adminCount}`);

  if (adminCount === 0) {
    console.log('WARNING: No super admin found. Run: npm run seed:admin');
  }

  console.log(allOk ? '\nAll collections verified.' : '\nSome checks failed.');
  process.exit(allOk ? 0 : 1);
}

verifyDatabase().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
