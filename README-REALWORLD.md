# EstateMind – Real-world workspace update

This update preserves the existing Next.js application and adds authenticated, MongoDB-backed workspace modules.

## Login and session fixes

- Middleware is Edge-safe and no longer imports Node-only JWT/crypto dependencies. Middleware checks for the session cookie; the protected server layout performs the authoritative JWT + MongoDB session check.
- Login and signup now perform a full browser navigation to the server-provided portal dashboard after the API has set the HttpOnly cookie. This avoids stale App Router state after authentication.
- Portal access checks confirm the session belongs to the requested portal and that the user/membership is still active.
- Logout performs a full navigation after clearing the session cookie.
- Password reset returns the user to the login page instead of a dashboard without an authenticated session.

## Workspace modules

All records below are persisted in MongoDB and scoped to the authenticated account where the data model supports ownership.

- **Estate:** properties, leads/CRM, appointments, property enquiries and support tickets.
- **Career:** resume library, job application tracker, interview practice sessions and support tickets.
- **Recruiter:** job vacancies and support tickets.
- **Admin:** user directory with activate/deactivate controls, cross-portal support operations and audit log.

The workspace API supports list, create, update and delete operations where appropriate. Inputs are allow-listed, ownership IDs are injected server-side, and create/update/delete operations are written to the audit log. Admin audit history is read-only.

## Health check

- `GET /api/health` checks application-to-MongoDB connectivity and returns HTTP 200 or 503.

## Setup

1. Use Node.js 20.19+ or Node.js 22.
2. Run `npm ci`.
3. Copy `.env.example` to `.env.local`.
4. Set `MONGODB_URI`, `MONGODB_DB`, and a unique production `JWT_SECRET`.
5. Configure MongoDB Atlas network access and a least-privilege database user.
6. Run `npm run typecheck`, `npm run build`, then `npm run dev`.
7. Check `/api/health` before testing login/signup.
8. Create the first Super Administrator using `npm run seed:admin`.

## Important production integrations

The application now has persistent workspace workflows, but real email delivery, SMS/WhatsApp, payment collection, maps/geocoding, cloud file storage, and external job-board/property-feed integrations still require provider accounts, credentials, callback URLs and production configuration. They must not be treated as live merely because the corresponding data models exist. Never commit `.env.local` or expose database credentials.
