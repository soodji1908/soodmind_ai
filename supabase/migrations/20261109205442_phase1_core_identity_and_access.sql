/*
# Core identity, portal access, and audit foundation

## 1. Plain-English summary
This migration creates the shared foundation for the ESTATEMIND AI platform: user profiles, portal memberships (which portal a user may enter and in what role), platform-level administrator roles, login activity history, notifications, audit logs, and platform settings.

When someone signs up through the Real Estate or Career portal, a profile is created automatically and a single membership is created for the portal they signed up through. Nobody can grant themselves a membership or the administrator role from the browser.

## 2. New tables
- `profiles`: one row per auth user (name, phone, avatar). Created automatically on signup.
- `portal_memberships`: links a user to one portal (`estate` or `career`) with a portal role and an active/suspended status. Role values are constrained per portal.
- `user_roles`: platform-wide roles. Currently only `super_admin`, which grants access to the Super Admin portal.
- `login_activity`: history of sign-ins, denied sign-ins, and sign-outs per portal.
- `notifications`: in-app notifications per user.
- `audit_logs`: append-only record of administrative actions.
- `platform_settings`: key/value platform configuration, administrators only.

## 3. Modified tables
- None. This is the first migration for these tables.

## 4. Functions and triggers
- `is_super_admin()`: returns true when the current user holds the `super_admin` role. Used by row-level security policies.
- `handle_new_user()`: runs after a new auth user is created. Creates the profile and, if the signup names a valid portal and role, the matching portal membership.
- `admin_platform_counts()`: returns headline platform counts for administrators only.
- `set_updated_at()`: keeps `updated_at` current on edited rows.

## 5. Security changes
- Row level security is enabled on every new table.
- Column-level grants: users may only edit their own name, phone and avatar. Membership role and status can only be changed by administrators.
- Membership and role rows cannot be inserted from the browser, so privilege escalation through the client is blocked.
- Helper functions are not callable by anonymous visitors.

## 6. Important notes
1. Portal roles are constrained in the database (for example, an `estate` membership cannot have a `student` role).
2. The first Super Admin account must be granted directly in the database by the platform owner. There is no self-service path to administrator access.
3. Login activity rows can only be written for the signed-in user themselves.
4. All statements are idempotent so the migration is safe to re-run.
*/

-- Tables

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL DEFAULT '',
  phone text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT profiles_full_name_length CHECK (char_length(full_name) <= 120),
  CONSTRAINT profiles_phone_length CHECK (phone IS NULL OR char_length(phone) <= 30)
);

CREATE TABLE IF NOT EXISTS user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('super_admin')),
  granted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  granted_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT user_roles_user_role_unique UNIQUE (user_id, role)
);

CREATE TABLE IF NOT EXISTS portal_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  portal text NOT NULL CHECK (portal IN ('estate', 'career')),
  role text NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT portal_memberships_user_portal_unique UNIQUE (user_id, portal),
  CONSTRAINT portal_memberships_role_matches_portal CHECK (
    (portal = 'estate' AND role IN ('buyer', 'seller', 'owner', 'agent', 'investor'))
    OR (portal = 'career' AND role IN ('student', 'job_seeker', 'recruiter', 'career_counselor'))
  )
);

CREATE TABLE IF NOT EXISTS login_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  portal text NOT NULL CHECK (portal IN ('estate', 'career', 'admin')),
  event text NOT NULL CHECK (event IN ('login_success', 'login_denied', 'logout')),
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  portal text CHECK (portal IS NULL OR portal IN ('estate', 'career', 'admin')),
  title text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 160),
  body text NOT NULL DEFAULT '' CHECK (char_length(body) <= 2000),
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL CHECK (char_length(action) BETWEEN 1 AND 120),
  entity_type text,
  entity_id text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS platform_settings (
  key text PRIMARY KEY CHECK (char_length(key) BETWEEN 1 AND 100),
  value jsonb NOT NULL,
  description text,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes

CREATE INDEX IF NOT EXISTS portal_memberships_user_id_idx ON portal_memberships (user_id);
CREATE INDEX IF NOT EXISTS user_roles_user_id_idx ON user_roles (user_id);
CREATE INDEX IF NOT EXISTS login_activity_user_created_idx ON login_activity (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS login_activity_created_idx ON login_activity (created_at DESC);
CREATE INDEX IF NOT EXISTS notifications_user_created_idx ON notifications (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS audit_logs_created_idx ON audit_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS audit_logs_actor_idx ON audit_logs (actor_id);

-- Helper functions

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = 'super_admin'
  );
$$;

REVOKE EXECUTE ON FUNCTION public.is_super_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_super_admin() TO authenticated;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  requested_portal text := NEW.raw_user_meta_data ->> 'portal';
  requested_role text := NEW.raw_user_meta_data ->> 'portal_role';
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    LEFT(COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''), 120)
  )
  ON CONFLICT (id) DO NOTHING;

  IF (requested_portal = 'estate' AND requested_role IN ('buyer', 'seller', 'owner', 'agent', 'investor'))
     OR (requested_portal = 'career' AND requested_role IN ('student', 'job_seeker', 'recruiter', 'career_counselor'))
  THEN
    INSERT INTO public.portal_memberships (user_id, portal, role)
    VALUES (NEW.id, requested_portal, requested_role)
    ON CONFLICT (user_id, portal) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.admin_platform_counts()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_super_admin() THEN
    RAISE EXCEPTION 'Administrator access required' USING ERRCODE = '42501';
  END IF;

  RETURN jsonb_build_object(
    'total_users', (SELECT count(*) FROM auth.users),
    'estate_members', (SELECT count(*) FROM portal_memberships WHERE portal = 'estate'),
    'career_members', (SELECT count(*) FROM portal_memberships WHERE portal = 'career'),
    'administrators', (SELECT count(*) FROM user_roles WHERE role = 'super_admin'),
    'suspended_memberships', (SELECT count(*) FROM portal_memberships WHERE status = 'suspended'),
    'logins_last_24h', (SELECT count(*) FROM login_activity WHERE event = 'login_success' AND created_at > now() - interval '24 hours'),
    'denied_logins_last_24h', (SELECT count(*) FROM login_activity WHERE event = 'login_denied' AND created_at > now() - interval '24 hours')
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_platform_counts() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_platform_counts() TO authenticated;

DROP TRIGGER IF EXISTS profiles_set_updated_at ON profiles;
CREATE TRIGGER profiles_set_updated_at BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS portal_memberships_set_updated_at ON portal_memberships;
CREATE TRIGGER portal_memberships_set_updated_at BEFORE UPDATE ON portal_memberships
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS platform_settings_set_updated_at ON platform_settings;
CREATE TRIGGER platform_settings_set_updated_at BEFORE UPDATE ON platform_settings
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Row level security

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

-- Grants (column-restricted where users must not control the value)

GRANT SELECT ON profiles TO authenticated;
GRANT UPDATE (full_name, phone, avatar_url) ON profiles TO authenticated;

GRANT SELECT ON user_roles TO authenticated;

GRANT SELECT ON portal_memberships TO authenticated;
GRANT UPDATE (role, status) ON portal_memberships TO authenticated;

GRANT SELECT, INSERT ON login_activity TO authenticated;

GRANT SELECT, INSERT, DELETE ON notifications TO authenticated;
GRANT UPDATE (read_at) ON notifications TO authenticated;

GRANT SELECT, INSERT ON audit_logs TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON platform_settings TO authenticated;

-- Policies: profiles

DROP POLICY IF EXISTS "profiles_select_own_or_admin" ON profiles;
CREATE POLICY "profiles_select_own_or_admin" ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = id OR public.is_super_admin());

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Policies: user_roles

DROP POLICY IF EXISTS "user_roles_select_own_or_admin" ON user_roles;
CREATE POLICY "user_roles_select_own_or_admin" ON user_roles FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR public.is_super_admin());

-- Policies: portal_memberships

DROP POLICY IF EXISTS "portal_memberships_select_own_or_admin" ON portal_memberships;
CREATE POLICY "portal_memberships_select_own_or_admin" ON portal_memberships FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR public.is_super_admin());

DROP POLICY IF EXISTS "portal_memberships_admin_update" ON portal_memberships;
CREATE POLICY "portal_memberships_admin_update" ON portal_memberships FOR UPDATE
TO authenticated
USING (public.is_super_admin())
WITH CHECK (public.is_super_admin());

-- Policies: login_activity

DROP POLICY IF EXISTS "login_activity_select_own_or_admin" ON login_activity;
CREATE POLICY "login_activity_select_own_or_admin" ON login_activity FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR public.is_super_admin());

DROP POLICY IF EXISTS "login_activity_insert_own" ON login_activity;
CREATE POLICY "login_activity_insert_own" ON login_activity FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policies: notifications

DROP POLICY IF EXISTS "notifications_select_own" ON notifications;
CREATE POLICY "notifications_select_own" ON notifications FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "notifications_admin_insert" ON notifications;
CREATE POLICY "notifications_admin_insert" ON notifications FOR INSERT
TO authenticated
WITH CHECK (public.is_super_admin());

DROP POLICY IF EXISTS "notifications_update_own" ON notifications;
CREATE POLICY "notifications_update_own" ON notifications FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "notifications_delete_own" ON notifications;
CREATE POLICY "notifications_delete_own" ON notifications FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Policies: audit_logs (administrators only, append-only)

DROP POLICY IF EXISTS "audit_logs_admin_select" ON audit_logs;
CREATE POLICY "audit_logs_admin_select" ON audit_logs FOR SELECT
TO authenticated
USING (public.is_super_admin());

DROP POLICY IF EXISTS "audit_logs_admin_insert" ON audit_logs;
CREATE POLICY "audit_logs_admin_insert" ON audit_logs FOR INSERT
TO authenticated
WITH CHECK (public.is_super_admin() AND actor_id = auth.uid());

-- Policies: platform_settings (administrators only)

DROP POLICY IF EXISTS "platform_settings_admin_select" ON platform_settings;
CREATE POLICY "platform_settings_admin_select" ON platform_settings FOR SELECT
TO authenticated
USING (public.is_super_admin());

DROP POLICY IF EXISTS "platform_settings_admin_insert" ON platform_settings;
CREATE POLICY "platform_settings_admin_insert" ON platform_settings FOR INSERT
TO authenticated
WITH CHECK (public.is_super_admin());

DROP POLICY IF EXISTS "platform_settings_admin_update" ON platform_settings;
CREATE POLICY "platform_settings_admin_update" ON platform_settings FOR UPDATE
TO authenticated
USING (public.is_super_admin())
WITH CHECK (public.is_super_admin());

DROP POLICY IF EXISTS "platform_settings_admin_delete" ON platform_settings;
CREATE POLICY "platform_settings_admin_delete" ON platform_settings FOR DELETE
TO authenticated
USING (public.is_super_admin());

-- Seed default platform settings (stable keys, safe to re-run)

INSERT INTO platform_settings (key, value, description) VALUES
  ('maintenance_mode', 'false'::jsonb, 'When true, portal dashboards show a maintenance notice to non-administrators.'),
  ('estate_signups_enabled', 'true'::jsonb, 'Allows new Real Estate portal registrations.'),
  ('career_signups_enabled', 'true'::jsonb, 'Allows new CareerMind portal registrations.')
ON CONFLICT (key) DO NOTHING;
