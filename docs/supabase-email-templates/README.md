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

In **Supabase Dashboard → Authentication → Email Templates**, replace the
default HTML for each type with the matching file in this folder.

Suggested subjects (set in the same dashboard screen):

| Template | File | Subject |
| --- | --- | --- |
| Confirm signup | `confirm-signup.html` | `Potvrďte účet \| Domy v Itálii` |
| Magic link | `magic-link.html` | `Přihlašovací odkaz \| Domy v Itálii` |
| Reset password | `reset-password.html` | `Obnovení hesla \| Domy v Itálii` |

Keep the GoTrue variables as-is (`{{ .ConfirmationURL }}`, `{{ .Email }}`,
`{{ .SiteURL }}`). Do not rewrite them to app URLs; Supabase fills them when
the email is sent.

After saving, request a reset link, a magic link, and a new signup from
https://www.domyvitalii.cz and check that each email is Czech, branded, and
sent through Resend.
