# Auth e-maily – Domy v Itálii

Přihlášení a registrace už **nepoužívají e-maily Supabase** (přihlašovací odkaz, ověřovací kód, odkaz na reset hesla).
Všechny auth e-maily posílá aplikace sama přes Resend:

| E-mail | Kdy | Kód |
|---|---|---|
| 5a „Vaše heslo do Klubu Domy v Itálii“ | registrace e-mailem (`/api/auth/register`) | `lib/passwordEmail.js` (`kind: 'registration'`) |
| 5b „Nové heslo do Klubu Domy v Itálii“ | „Zapomenuté heslo?“ (`/api/auth/forgot-password`) | `lib/passwordEmail.js` (`kind: 'newPassword'`) |
| Uvítací e-mail | první přihlášení přes Google | `lib/welcomeEmail.js` |

Odesílatel: `Domy v Itálii <info@domyvitalii.cz>` (env `AUTH_EMAIL_FROM`, výchozí hodnota v kódu).
E-mail obsahuje heslo a jediné tlačítko na `https://domyvitalii.cz/login` – žádný přihlašovací odkaz s tokenem.

## Co nastavit

- Vercel env: `RESEND_API_KEY` (doména `domyvitalii.cz` je v Resendu ověřená). Bez klíče se e-mail s heslem
  v produkci **neodešle** a registrace vrátí chybu (heslo se nikdy nezapisuje do logu).
- Supabase dashboard → Authentication → Email Templates: šablony se už nepoužívají, není potřeba je měnit.
  Supabase je pošle jen při ruční akci v dashboardu (pozvánka, změna e-mailu).
- Supabase → Authentication → Providers → Email: musí zůstat zapnutý (přihlášení heslem).
  „Confirm email“ může zůstat zapnuté – účty z registrace se zakládají rovnou jako potvrzené.
