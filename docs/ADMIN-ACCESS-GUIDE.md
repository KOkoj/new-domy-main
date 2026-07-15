# Admin Panel — Access & Overview

## Who can access `/admin`

Access is enforced **server-side** in `app/admin/layout.js` via `getAdminAccess()`
(`lib/adminAuth.js`). A user is an admin when either:

1. Their `profiles.role` is `'admin'`, or
2. Their email is listed in the `ADMIN_EMAILS` environment variable
   (comma-separated allowlist; empty by default).

Non-admins are redirected away from every `/admin` page. All `/api/admin/*`
routes independently enforce the same check via `requireAdminApiAccess()` and
perform database/storage operations with the Supabase **service-role** client.

### Granting admin access

- Preferred: set `role = 'admin'` on the user's row in the `profiles` table
  (Supabase dashboard or SQL).
- Alternative: add the user's email to `ADMIN_EMAILS` in the environment
  (see `env.template`).

## Pages

```
/admin               → Dashboard: user/inquiry/favorite/search counts, recent users & inquiries
/admin/users         → User management: list, search, filter, change roles (via /api/admin/users)
/admin/inquiries     → Inquiry triage: list, search, respond by email, pending/responded status
/admin/intake-forms  → Submitted client intake forms
/admin/documents     → Premium document upload/management (via /api/admin/documents)
/admin/content       → Properties & regions (Sanity CMS, via /api/content)
/admin/club-content  → Klub premium content (via /api/admin/club-content)
/admin/email-test    → Email/system testing tool (not in the nav; direct URL only)
```

## Environment variables that affect admin

| Variable | Purpose |
| --- | --- |
| `ADMIN_EMAILS` | Comma-separated emails always treated as admins |
| `ADMIN_NOTIFY_EMAIL` | Inbox notified about new inquiries |
| `ADMIN_LAUNCH_TOOLS_ENABLED` | Enables AI translation / description tools in `/admin/content` |
| `RESEND_API_KEY` | Real email sending (otherwise emails are logged to console) |
| `GEMINI_API_KEY` | AI-generated email content (otherwise static templates) |
| `CRON_SECRET` | Required for cron endpoints and the manual alert trigger in `/admin/email-test` |

## Database policies

Run `db/final-admin-rls.sql` (Supabase SQL editor) to apply the canonical RLS
for `premium_documents`, `premium_content`, and the `documents` storage bucket.
Admin writes to those tables go through server API routes with the service-role
key, so no permissive client-side write policies are needed.

## Troubleshooting

- **Redirected away from /admin** — your profile role is not `'admin'` and your
  email is not in `ADMIN_EMAILS`. Fix either and log in again.
- **401/403 from /api/admin/*** — same cause; the API routes re-check access on
  every request.
- **Content page empty** — Sanity credentials are missing; check
  `NEXT_PUBLIC_SANITY_PROJECT_ID` and `SANITY_API_TOKEN`.
- **Emails not arriving** — check the status card on `/admin/email-test`; if
  Resend is not configured, emails are only logged to the server console.
