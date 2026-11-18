// E-mails with a generated password (Figma frames 5a and 5b).
// 5a "registration": first password of a new account.
// 5b "newPassword": "Zapomenuté heslo" - the old password keeps working.
// Czech texts are the approved Figma copy; en/it are translations of it.
// The only link is a plain button to the website (no sign-in token).

export const AUTH_EMAIL_FROM_DEFAULT = 'Domy v Itálii <info@domyvitalii.cz>'
const CONTACT_EMAIL = 'info@domyvitalii.cz'

const COPY = {
  cs: {
    registration: {
      subject: 'Vaše heslo do Klubu Domy v Itálii',
      title: 'Vítejte v Klubu Domy v Itálii',
      intro: 'Dobrý den, děkujeme za registraci. Tady je heslo k vašemu účtu:',
      passwordLabel: 'VAŠE HESLO',
      signIn: 'Přihlaste se e-mailem {email} a tímto heslem – na počítači, na mobilu i na jiném zařízení.',
      warning: 'Heslo nikomu nepřeposílejte – my vás o něj nikdy žádat nebudeme. Pokud jste se neregistrovali vy, e-mail klidně ignorujte.'
    },
    newPassword: {
      subject: 'Nové heslo do Klubu Domy v Itálii',
      title: 'Vaše nové heslo',
      intro: 'Dobrý den, na webu domyvitalii.cz jste požádali o nové heslo. Tady je:',
      passwordLabel: 'NOVÉ HESLO',
      signIn: 'Přihlaste se e-mailem {email} a tímto heslem. Vaše dosavadní heslo platí dál, dokud se nepřihlásíte tímto novým.',
      warning: 'Heslo nikomu nepřeposílejte – my vás o něj nikdy žádat nebudeme. Pokud jste o nové heslo nežádali, e-mail klidně ignorujte – dosavadní heslo dál platí.'
    },
    caseHint: 'Rozlišujte velká a malá písmena.',
    button: 'Přihlásit se na domyvitalii.cz',
    ownPassword: 'Vlastní heslo si můžete nastavit po přihlášení v Nastavení účtu.'
  },
  en: {
    registration: {
      subject: 'Your password for the Domy v Itálii Club',
      title: 'Welcome to the Domy v Itálii Club',
      intro: 'Hello, thank you for registering. Here is the password for your account:',
      passwordLabel: 'YOUR PASSWORD',
      signIn: 'Sign in with the e-mail {email} and this password – on your computer, phone or any other device.',
      warning: 'Never forward this password – we will never ask you for it. If you did not register, you can safely ignore this e-mail.'
    },
    newPassword: {
      subject: 'New password for the Domy v Itálii Club',
      title: 'Your new password',
      intro: 'Hello, you asked for a new password on domyvitalii.cz. Here it is:',
      passwordLabel: 'NEW PASSWORD',
      signIn: 'Sign in with the e-mail {email} and this password. Your current password keeps working until you sign in with this new one.',
      warning: 'Never forward this password – we will never ask you for it. If you did not ask for a new password, you can safely ignore this e-mail – your current password still works.'
    },
    caseHint: 'Upper and lower case letters matter.',
    button: 'Sign in at domyvitalii.cz',
    ownPassword: 'You can set your own password after signing in, in Account settings.'
  },
  it: {
    registration: {
      subject: 'La tua password per il Club Domy v Itálii',
      title: 'Benvenuto nel Club Domy v Itálii',
      intro: 'Buongiorno, grazie per la registrazione. Ecco la password del tuo account:',
      passwordLabel: 'LA TUA PASSWORD',
      signIn: 'Accedi con l’e-mail {email} e questa password – dal computer, dal telefono o da un altro dispositivo.',
      warning: 'Non inoltrare la password a nessuno – non te la chiederemo mai. Se non ti sei registrato tu, ignora pure questa e-mail.'
    },
    newPassword: {
      subject: 'Nuova password per il Club Domy v Itálii',
      title: 'La tua nuova password',
      intro: 'Buongiorno, su domyvitalii.cz hai chiesto una nuova password. Eccola:',
      passwordLabel: 'NUOVA PASSWORD',
      signIn: 'Accedi con l’e-mail {email} e questa password. La password attuale resta valida finché non accedi con quella nuova.',
      warning: 'Non inoltrare la password a nessuno – non te la chiederemo mai. Se non hai chiesto una nuova password, ignora pure questa e-mail – la password attuale resta valida.'
    },
    caseHint: 'Maiuscole e minuscole contano.',
    button: 'Accedi su domyvitalii.cz',
    ownPassword: 'Dopo l’accesso puoi impostare una password tua in Impostazioni account.'
  }
}

export const PASSWORD_EMAIL_KINDS = ['registration', 'newPassword']

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function getPasswordEmailCopy(kind, language = 'cs') {
  const base = COPY[language] || COPY.cs
  const variant = base[kind] || base.registration
  return { ...variant, caseHint: base.caseHint, button: base.button, ownPassword: base.ownPassword }
}

/**
 * @param {{ kind: 'registration' | 'newPassword', email: string, password: string, loginUrl: string, language?: string }} input
 * @returns {{ subject: string, html: string, text: string }}
 */
export function buildPasswordEmail({ kind, email, password, loginUrl, language = 'cs' }) {
  const copy = getPasswordEmailCopy(kind, language)
  const signInHtml = escapeHtml(copy.signIn).replace(
    '{email}',
    `<strong style="color:#0f172a;">${escapeHtml(email)}</strong>`
  )
  const signInText = copy.signIn.replace('{email}', email)
  const safeUrl = escapeHtml(loginUrl)

  const html = `<!doctype html>
<html lang="${escapeHtml(language)}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(copy.subject)}</title></head>
<body style="margin:0;padding:0;background:#f7f4ed;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f7f4ed;padding:32px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #e7e1d6;border-radius:16px;font-family:Arial,Helvetica,sans-serif;color:#334155;">
        <tr><td style="padding:36px 40px 8px;">
          <h1 style="margin:0 0 16px;font-size:24px;line-height:1.3;color:#1e293b;">${escapeHtml(copy.title)}</h1>
          <p style="margin:0;font-size:16px;line-height:1.6;">${escapeHtml(copy.intro)}</p>
        </td></tr>
        <tr><td style="padding:20px 40px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#faf6f3;border:1px solid #e7d9c9;border-radius:12px;">
            <tr><td align="center" style="padding:20px 16px;">
              <p style="margin:0 0 6px;font-size:12px;letter-spacing:0.12em;color:#aa6a3f;font-weight:bold;">${escapeHtml(copy.passwordLabel)}</p>
              <p style="margin:0;font-family:'Courier New',Courier,monospace;font-size:32px;letter-spacing:0.18em;font-weight:bold;color:#1e293b;">${escapeHtml(password)}</p>
              <p style="margin:8px 0 0;font-size:13px;color:#64748b;">${escapeHtml(copy.caseHint)}</p>
            </td></tr>
          </table>
        </td></tr>
        <tr><td style="padding:4px 40px 0;">
          <p style="margin:0;font-size:16px;line-height:1.6;">${signInHtml}</p>
        </td></tr>
        <tr><td align="center" style="padding:24px 40px;">
          <a href="${safeUrl}" style="display:inline-block;background:#1e293b;color:#ffffff;text-decoration:none;font-weight:bold;font-size:16px;padding:14px 28px;border-radius:10px;">${escapeHtml(copy.button)}</a>
        </td></tr>
        <tr><td style="padding:0 40px;">
          <p style="margin:0 0 16px;font-size:15px;line-height:1.6;">${escapeHtml(copy.ownPassword)}</p>
          <p style="margin:0 0 28px;font-size:13px;line-height:1.6;color:#64748b;">${escapeHtml(copy.warning)}</p>
        </td></tr>
        <tr><td align="center" style="padding:20px 40px 28px;border-top:1px solid #eee7dc;font-size:12px;line-height:1.7;color:#94a3b8;">
          Domy v Itálii · ${CONTACT_EMAIL} · domyvitalii.cz<br>Creavita s.r.o.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

  const text = [
    copy.title,
    copy.intro,
    `${copy.passwordLabel}: ${password}`,
    copy.caseHint,
    signInText,
    `${copy.button}: ${loginUrl}`,
    copy.ownPassword,
    copy.warning,
    `Domy v Itálii · ${CONTACT_EMAIL} · domyvitalii.cz\nCreavita s.r.o.`
  ].join('\n\n')

  return { subject: copy.subject, html, text }
}
