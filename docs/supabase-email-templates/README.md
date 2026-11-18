# Supabase Auth emails (Domy v Itálii)

Supabase currently sends reset-password, magic-link, and confirm-signup emails
from `noreply@mail.app.supabase.io` using the default English templates. That
sender is rate-limited. Templates live in the Supabase dashboard, not in the
app runtime, so this folder is the copy-paste source of truth.

The HTML files match the welcome email style used by Resend (Arial, slate
text, uppercase eyebrow, dark CTA button). Czech is the primary language, with
a short English fallback under the main copy.

## 1. Point Auth custom SMTP at the existing Resend account

Do this in the **canonical** Supabase project used by production. Do not create
a new Resend account.

1. In Resend, confirm the domain `domyvitalii.cz` is verified and that
   `info@domyvitalii.cz` is an allowed sender.
2. Create a **new** Resend API key (or reuse an existing server key). Store it
   in the password manager. Do not put the key in this repo.
3. Open **Supabase Dashboard → Authentication → Emails → SMTP Settings**.
4. Enable custom SMTP and fill in:

   | Field | Value |
   | --- | --- |
   | Host | `smtp.resend.com` |
   | Port | `465` |
   | Username | `resend` |
   | Password | the Resend API key from step 2 |
   | Sender email | `info@domyvitalii.cz` |
   | Sender name | `Domy v Itálii` |

5. Save and send a test email from the same screen.
6. Confirm the message arrives from `info@domyvitalii.cz`, not
   `noreply@mail.app.supabase.io`.

Resend SMTP uses the same API-key password as the existing transactional
integration. Do not invent or commit any secret values.

## 2. Paste the branded templates

Sign-in and registration use a **6-digit e-mail code** (`{{ .Token }}`), not a
clickable "magic link". New e-mails get the **Confirm signup** template,
existing accounts get the **Magic Link** template, so both must show the code.
**Until both templates contain `{{ .Token }}`, the code step on the site
cannot work** (users would get an e-mail without a code).

In **Supabase Dashboard → Authentication → Emails → Templates**, replace the
default HTML for each type with the matching file in this folder and set the
subject:

| Template | File | Subject |
| --- | --- | --- |
| Confirm signup | `confirm-signup.html` | `Váš ověřovací kód pro Domy v Itálii` |
| Magic link | `magic-link.html` | `Váš ověřovací kód pro Domy v Itálii` |
| Reset password | `reset-password.html` | `Obnovení hesla \| Domy v Itálii` |

Plain subject list (copy-paste):

- Confirm signup: Váš ověřovací kód pro Domy v Itálii
- Magic link: Váš ověřovací kód pro Domy v Itálii
- Reset password: Obnovení hesla | Domy v Itálii

Variables used: `{{ .Token }}` (the code), `{{ .Email }}`, `{{ .SiteURL }}`,
`{{ .TokenHash }}`. The small fallback link in the code templates is
`{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=email`. It works
in any browser (no PKCE cookie needed); `/auth/callback` verifies it with
`verifyOtp({ token_hash, type: 'email' })` for new and existing accounts and
redirects to `/dashboard`. Because it uses `{{ .SiteURL }}`, the link always
points to production (Site URL), also for e-mails requested on a preview.
The reset-password template keeps `{{ .ConfirmationURL }}` - do not change it
without testing password recovery.

The templates are light HTML (no images, one small link) for better
deliverability.

## 3. Other dashboard settings (before merging the code sign-in)

1. **Authentication → Providers → Email**
   - "Allow new users to sign up": on (required for `shouldCreateUser: true`).
   - **Email OTP Length: `6`** (the site also accepts 7-8 digits, but the
     copy says "6místný kód").
   - **Email OTP Expiration: `3600`** seconds (1 hour; anything between 600
     and 3600 is fine - shorter is safer, longer is friendlier).
2. **Authentication → URL Configuration**
   - Site URL: `https://www.domyvitalii.cz`
   - Redirect URLs (allow-list, with `**` because the callback carries
     `?next=…&lang=…`):
     - `https://www.domyvitalii.cz/auth/callback**`
     - `https://domyvitalii.cz/auth/callback**`
     - `https://*-kokojs-projects.vercel.app/auth/callback**` (previews)
3. **SMTP** (section 1): custom SMTP through Resend, sender
   `info@domyvitalii.cz` (or `noreply@domyvitalii.cz` - decision for the
   owner; `info@` lets people reply, `noreply@` must still be a verified
   Resend sender). The site's registration page tells users to add
   `info@domyvitalii.cz` to their contacts - change it in
   `app/registrace/page.js` if the sender changes.
4. **Authentication → Rate Limits**: raise "emails per hour" to match ad
   traffic (custom SMTP is required for that). The site also limits
   `/api/auth/send-code` to 6 requests per IP per 10 minutes and has a
   honeypot field.
5. In Resend, check SPF/DKIM/DMARC for `domyvitalii.cz` are green
   (deliverability, spam folder).

After saving, on https://www.domyvitalii.cz request a code with a new e-mail,
with an existing account, and a password reset. Check that each e-mail is
Czech, shows the code, arrives from the Resend sender, and that the code and
the fallback link both sign in.
