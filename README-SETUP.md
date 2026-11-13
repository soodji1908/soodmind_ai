# EstateMind / CareerMind setup

## Requirements
- Node.js 20.19+ (Node.js 22 recommended)
- MongoDB Atlas or a reachable MongoDB server

## Install and configure
1. Run `npm install`.
2. Copy `.env.example` to `.env.local`.
3. Set `MONGODB_URI` to your MongoDB connection string and optionally set `MONGODB_DB`.
4. Set `JWT_SECRET` to a unique random secret (required in production).
5. For Resume Analysis and other ML features, set `ML_API_URL=http://localhost:8000` and a strong `ML_API_KEY` in the root `.env.local`. The `ML_API_KEY` must be the same key used by the Python service. The Python service automatically reads this root `.env.local` during local development.
6. In MongoDB Atlas, allow the application server's IP address and create a database user with read/write access to the selected database.
7. Run `npm run dev` and open the local URL printed by Next.js.

### Start Resume Analysis / ML service (Windows)

The Resume Analysis page uses the separate FastAPI service in `python-ml`. Setting `ML_API_URL` alone is not enough: the Python service must be running and both services must share the same `ML_API_KEY`.

```powershell
cd python-ml
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
cd ..
npm run ml:dev
```

Keep that terminal running. In a second terminal, from the project root, run `npm run dev`. The Python API health check is `http://127.0.0.1:8000/health` and its interactive docs are at `http://127.0.0.1:8000/docs`. If the service reports an unauthorized response, compare the `ML_API_KEY` values; do not expose the key in screenshots or logs.

## Useful checks
- `npm run typecheck`
- `npm run build`
- `npm run verify:db` (after configuring MongoDB)
- `npm run seed:admin` (after configuring MongoDB; use the script's prompts/options)

## Authentication notes
- Self-service signup is enabled for Estate, Career, and Recruiter portals.
- Admin signup is intentionally disabled. Create an administrator with the seed script.
- Passwords are stored as bcrypt hashes; session tokens are signed with `JWT_SECRET` and session records are stored in MongoDB.
- Password reset and email verification token fields are explicitly selected only by the corresponding verification/reset queries.

Never commit `.env.local` or share database credentials. If credentials were exposed publicly, rotate them in the provider console.

## Platform Owner Control Center

Sign in through `/admin/login` using a user assigned the `super_admin` role, then open **Platform controls** from the admin sidebar (`/admin/settings`). Settings are persisted in MongoDB `PlatformSettings` and changes are written to the audit log. The control center currently manages registration, property publishing/enquiries/appointments, map visibility/default zoom, marketplace limits, branding/support details and platform announcements. Registration and the property create/enquiry/appointment API gates read the stored flags server-side.

## Property analytics and Google Maps

The Estate portal now includes `/estate/insights` and dashboard portfolio analytics, status/city charts and Google Maps address previews. Add a property with a full address and city to show it on the map. Optional latitude/longitude fields can be saved for future coordinate-based map features. The current map preview uses Google's map search embed and does not require a browser API key. For production Places autocomplete, geocoding, route planning or advanced Maps JavaScript features, create a Google Cloud project, enable only the required APIs, restrict the browser key by HTTP referrer and API, and add the key through deployment secrets (never commit private credentials).

## Production integration checklist

Real payment collection, email delivery, SMS/WhatsApp, identity/KYC checks, map autocomplete/geocoding and automated scheduled reminders require third-party provider accounts, credentials, webhook endpoints, domain verification and end-to-end sandbox/live testing. The platform settings panel exposes rollout controls; do not enable a payment or verification workflow until its provider integration and webhooks have been configured and tested. Use HTTPS, a strong unique `JWT_SECRET`, MongoDB Atlas network/IP restrictions, backups and monitoring in production.


## AI assistant configuration

The in-app assistant uses an OpenAI-compatible Chat Completions endpoint. Add these server-only variables to `.env.local` and restart Next.js:

```env
AI_API_URL=https://api.openai.com/v1/chat/completions
AI_API_KEY=your_provider_api_key
AI_MODEL=gpt-4o-mini
```

Keep the key server-side; do not prefix it with `NEXT_PUBLIC_`. If no key is configured, the assistant shows a clear setup message rather than fabricated answers.
