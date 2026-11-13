/*
# Restrict execute rights on admin helper functions

1. Modified functions
- `admin_platform_counts()` and `is_super_admin()` are SECURITY DEFINER functions.

2. Security changes
- Revoke EXECUTE from PUBLIC and anon so logged-out visitors cannot call them.
- Signed-in users keep EXECUTE because row level security policies and the admin dashboard call them.
- `admin_platform_counts()` still rejects non-super-admin callers internally.
*/

REVOKE EXECUTE ON FUNCTION public.admin_platform_counts() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_platform_counts() TO authenticated;
REVOKE EXECUTE ON FUNCTION public.is_super_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_super_admin() TO authenticated;
