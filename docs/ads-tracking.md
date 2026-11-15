# Měření reklamy (Google Ads + Sklik, plán 3 000 Kč/měsíc)

Stav: kód je připravený, ale **nic se nenačítá**, dokud ve Vercelu nejsou ID
a dokud není schválený text souhlasu. Bez ID je web přesně jako dřív.

## Co je hotové v kódu

| Část | Soubor | Co dělá |
| --- | --- | --- |
| Souhlas (Consent Mode v2) | `lib/consent.js`, `components/AdsTracking.jsx` | Malý panel vlevo dole (žádná lišta přes celou šířku). Jedna volba Povolit / Odmítnout, cookie `dvi_consent` na 180 dní. Výchozí stav vše `denied`. |
| GA4 + Google Ads | `lib/adsTracking.js` | `gtag.js` se stáhne **až po kliknutí na Povolit**. GA4 `generate_lead`, Ads konverze Lead (s `transaction_id` = ID poptávky) a rozšířené konverze (SHA-256 e-mailu). |
| Sklik | `lib/adsTracking.js` | Nový skript SEM (`l.seznam.cz/sul.js`), také až po souhlasu. Události `PageView` (i při přechodu mezi stránkami), `Lead`, `Contact`. Starý `rc.js` se už nepoužívá. |
| Kliky na telefon / e-mail / WhatsApp | `components/ConversionTracking.jsx` | GA4 událost `phone_click` / `email_click` / `whatsapp_click`, Sklik `Contact`, Google Ads jen když je nastavený `NEXT_PUBLIC_GADS_CONTACT_LABEL`. |
| Odkud lead přišel | `lib/attribution.js`, `app/api/inquiries/route.js` | UTM + `gclid`/`gbraid`/`wbraid`/`sznclid`/`fbclid`, první a poslední návštěva z reklamy. Ukládá se k poptávce do Supabase. |
| Meta | `components/MetaTracking.jsx` | Dál vypnutá (prázdné `NEXT_PUBLIC_META_PIXEL_ID`). Používá stejný souhlas, událost `Lead` je připravená. |
| Vercel Analytics | beze změny | Události z PR #44/#47 (`inquiry_submit`, `phone_click`, …) běží dál jako dosud. |

Lead se odešle po **úspěšném** odeslání těchto formulářů: poptávka na detailu
nemovitosti (i přes tlačítko „Mám zájem“), kontaktní formulář, rezervace
hovoru (`/book-call`) a concierge požadavek v klubu.

## Co je potřeba založit (Matej / Lucie)

1. **GA4 property** (analytics.google.com) – časové pásmo Praha, měna CZK.
   Webový stream pro `https://www.domyvitalii.cz` → zkopírovat **Measurement ID** `G-…`.
   V GA4 označit událost `generate_lead` jako klíčovou událost (Key event).
2. **Google Ads účet** – měna CZK (nejde později změnit).
   - Cíle → Konverze → Nová konverzní akce → Web → ručně přes kód →
     kategorie *Odeslání formuláře pro potenciální zákazníky*, hodnota volitelně,
     počítat **Jedna** konverze na proklik.
   - Ze „Zobrazit kód“ vzít **ID** `AW-…` a **štítek konverze** (část za lomítkem).
   - V nastavení konverze zapnout **Rozšířené konverze** → metoda „Google tag“ / gtag.
   - Volitelně druhá akce *Kontakt* (sekundární, ne pro optimalizaci) pro kliky na telefon/WhatsApp → její štítek.
   - Propojit Google Ads s GA4 (Správce GA4 → Propojení služeb).
   - Ponechat zapnuté automatické označování (gclid).
3. **Sklik účet** (sklik.cz)
   - Nastavení účtu → **SEM ID** (Zobrazit SEM kód, číslo v `?id=`).
   - Správa měření / Správa konverzí: vytvořit konverzi z události **Lead**
     (případně mikrokonverzi z `Contact`). Retargetingové publikum se tvoří
     automaticky z `PageView`.
   - Zapnout **automatické tagování** cílových URL (UTM `utm_source=seznam`).
4. **Schválit text souhlasu** (viz popis PR) a doplnit odstavec do
   `/cookies` (návrh je také v PR). Do té doby nechat `NEXT_PUBLIC_CONSENT_PROMPT` prázdné.
5. **Spustit migraci** `db/add-inquiry-attribution-columns.sql` v Supabase SQL Editoru
   (bez ní web funguje, jen se zdroj leadu neuloží).

## Proměnné ve Vercelu (Production i Preview)

| Proměnná | Příklad | Povinná |
| --- | --- | --- |
| `NEXT_PUBLIC_GA4_ID` | `G-ABC123XYZ9` | ano |
| `NEXT_PUBLIC_GADS_ID` | `AW-123456789` | ano |
| `NEXT_PUBLIC_GADS_LEAD_LABEL` | `AbCdEfGhIjk` | ano |
| `NEXT_PUBLIC_GADS_CONTACT_LABEL` | `XyZ…` | ne |
| `NEXT_PUBLIC_SKLIK_ID` | `123456` | ano (pro Sklik) |
| `NEXT_PUBLIC_CONSENT_PROMPT` | `1` | až po schválení textu |

`NEXT_PUBLIC_*` se zapisují do kódu při buildu → po změně je nutný **nový deploy**
(Redeploy v Vercelu). Bez `NEXT_PUBLIC_CONSENT_PROMPT=1` se panel neukáže a bez
souhlasu se žádný tag nenačte – tj. ID lze nastavit klidně dřív.

## Jak ověřit

1. Otevřít web v anonymním okně s `?utm_source=test&gclid=TEST123`.
   Vlevo dole se ukáže malý panel. **Před kliknutím** v DevTools → Network nesmí
   být žádný požadavek na `googletagmanager.com` ani `l.seznam.cz`.
2. Kliknout **Povolit** → objeví se `gtag/js?id=G-…` a `sul.js?id=…`.
3. **Google Tag Assistant** (tagassistant.google.com) → Add domain → `https://www.domyvitalii.cz`:
   - Consent: default `denied`, po Povolit `update` → `granted`.
   - Po odeslání poptávky: GA4 `generate_lead` a Google Ads `conversion` se štítkem Leadu, `user_data` (hash e-mailu).
4. GA4 → Správce → **DebugView** / Realtime: `generate_lead`.
5. Google Ads → konverzní akce: stav „Zaznamenává konverze“ do ~24 h.
6. Sklik: Správa měření → diagnostika / testování (sandbox) – `PageView`, `Lead`.
7. Supabase → tabulka `inquiries`: nová poptávka má `utmSource`, `gclid`, `attribution`.
8. Kliknout **Odmítnout** v jiném anonymním okně → žádné požadavky na Google/Seznam.

Konzole prohlížeče: `window.dataLayer` ukáže vše, co šlo do gtag.

## Odvolání souhlasu

Jakýkoli prvek s atributem `data-consent-open` panel znovu otevře. Návrh: odkaz
„Nastavení cookies“ v patičce (text čeká na schválení, proto zatím není nasazený).

## Poznámky

- Atribuce se bez souhlasu drží jen v `sessionStorage` (do zavření karty) a posílá
  se jen na náš server s poptávkou. Po souhlasu se uloží na 90 dní (`localStorage`).
- `gclid` u poptávky umožní později import offline konverzí (např. „kvalifikovaný lead“
  označený Lucií) do Google Ads.
- Meta Pixel zůstává vypnutý; při zapnutí stačí `NEXT_PUBLIC_META_PIXEL_ID`
  (+ `META_CONVERSIONS_API_TOKEN`) – Lead se pak pošle prohlížečem i přes CAPI se stejným `event_id`.
