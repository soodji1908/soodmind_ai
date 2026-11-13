# EstateMind AI — Project updates (13 Nov 2026)

This update is additive. Existing portal route groups, authentication, workspace APIs, and existing pages are retained.

## Existing portal routes in this project

- Career / CareerMind AI: `/career` — layout: `app/career/(portal)/layout.tsx`; dashboard: `app/career/(portal)/dashboard/page.tsx`; dynamic workspace pages: `app/career/(portal)/[section]/page.tsx`.
- Building / property portal (currently branded EstateMind): `/estate` — layout: `app/estate/(portal)/layout.tsx`; dashboard: `app/estate/(portal)/dashboard/page.tsx`; dynamic workspace pages: `app/estate/(portal)/[section]/page.tsx`.
- Job / recruiter portal: `/recruiter` — layout: `app/recruiter/(portal)/layout.tsx`; dashboard: `app/recruiter/(portal)/dashboard/page.tsx`; dynamic workspace pages: `app/recruiter/(portal)/[section]/page.tsx`.
- Platform administration: `/admin`.

The project uses route groups `(portal)` and `(auth)`. Parentheses are Next.js route-group names and do not appear in public URLs. The building/property product is already implemented as the `estate` portal, and the job portal is already implemented as `recruiter`; this update does not create duplicate authentication systems or rename those existing routes.

## Additions in this update

1. Portal footer on authenticated portal pages, with links to Platform Ownership and All Portals.
2. Home page footer link to Platform Ownership.
3. New public page: `/ownership`. It reads only server-side environment values and never invents founder/co-founder or legal-entity details.
4. Workspace records now support editing existing records through the existing PATCH API. Resume entries have View and Edit controls in addition to existing Add and Delete controls.
5. Resume analysis persistence now stores filename, file type, MIME type, and the original uploaded PDF/DOCX bytes in the user's MongoDB Resume record. A user-scoped authenticated file endpoint allows the owner to open PDFs or download the original file.
6. Resume analysis now reports a save failure instead of silently pretending that an unsaved record was saved.

## Publishing verified ownership information

Set these server-side environment variables in `.env.local` for local development or in your hosting provider's environment settings:

```env
PLATFORM_FOUNDER_NAME=
PLATFORM_COFOUNDER_NAMES=
PLATFORM_LEGAL_ENTITY=
PLATFORM_CONTACT_EMAIL=
PLATFORM_WEBSITE=
```

- `PLATFORM_FOUNDER_NAME`: verified founder name.
- `PLATFORM_COFOUNDER_NAMES`: verified co-founder names, separated by commas.
- `PLATFORM_LEGAL_ENTITY`: registered legal entity name, if applicable.
- `PLATFORM_CONTACT_EMAIL`: official contact email.
- `PLATFORM_WEBSITE`: official website.

Leave values blank until verified. Restart/redeploy the app after changing environment variables. No founder or co-founder identity was included in the supplied project ZIP, so the ownership page intentionally displays “Not publicly configured” until you provide verified values.

## Setup and verification

From the `project` directory:

```bash
npm ci
npm run typecheck
npm run build
npm run dev
```

Configure the existing required MongoDB and ML environment variables using `.env.example` and the existing setup documentation. Do not commit `.env.local` or production secrets.

## Important storage note

The original uploaded PDF/DOCX is stored as a MongoDB Buffer in the Resume document. The upload limit remains 10 MB, below MongoDB's 16 MB document limit. Text-pasted resumes are stored as text. Existing older records that were previously saved with the placeholder `(uploaded file)` do not contain their original file bytes; they cannot be reconstructed from this update and must be uploaded again if the original file is needed.
