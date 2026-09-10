# Verifica SEO tecnica — 9 settembre 2026

Branch locale: `fix/technical-seo-legacy`, creata da `origin/master` aggiornato.
Nessun push, deploy, cambio DNS o modifica dell'inventario immobili.

## URL legacy e redirect

| URL | Risultato previsto | Destinazione |
| --- | --- | --- |
| `/?s=373` | 301 diretto | `/guides/costs` (200) |
| `/?s=360` | 410 invariato | Legacy non identificato; nessuna destinazione inventata |
| `/?s=372` | 410 invariato | Legacy non identificato; nessuna destinazione inventata |
| `/regions/lombardy` | 301 diretto | `/regions/lombardia` (200) |

La regola per 373 precede la risposta 410 dei parametri numerici. Elimina la query
dalla destinazione, anche in presenza di parametri di tracciamento aggiuntivi.
I parametri dei filtri immobili non vengono modificati.

## Metadata

Canonical self-referencing, title, description e Open Graph specifici in ceco
per `/about`, `/contact`, `/guides`, `/faq`. I testi sono basati rispettivamente
su presentazione del team e metodo, contatti e formulario, raccolta di guide,
domande frequenti. Nessuna riscrittura del contenuto visibile.

| Pagina | Title |
| --- | --- |
| `/about` | O nás a náš tým \| Domy v Itálii |
| `/contact` | Kontakt a konzultace \| Domy v Itálii |
| `/guides` | Průvodce koupí nemovitosti v Itálii \| Domy v Itálii |
| `/faq` | Časté otázky ke koupi nemovitosti v Itálii \| Domy v Itálii |

Il controllo integrale della sitemap ha individuato canonical verso homepage
anche su `/regions`, `/process`, `/gdpr`, `/terms`: per mantenere queste pagine
nella sitemap è stato corretto **soltanto il canonical**, senza altre modifiche
ai loro metadata o contenuti.

Tutti i canonical utilizzano `https://www.domyvitalii.cz` più il percorso della
pagina. Le due guide indicate dall'utente mantengono i canonical preesistenti.

## Regioni e articoli regionali

La whitelist deriva da `REGION_DATA_OVERRIDES`, già usata per contenuti, metadata
e generazione statica. Tutti gli slug con contenuto regionale effettivo sono
compresi; gli alias già supportati sono conservati. `dynamicParams = false`
impedisce il rendering a richiesta di slug sconosciuti; `notFound()` protegge
anche pagina e metadata. Non viene creato contenuto per nomi di regioni privi
di una pagina nell'inventario editoriale.

Questi URL devono restituire vere risposte HTTP 404:

- `/regions/seo-audit-nonexistent-92841`
- `/regions/questa-regione-non-esiste`
- `/blog/regions/toscana`

L'ultimo URL non conteneva un articolo: il componente mostrava “Blog post not
found” con stato 200. L'inventario effettivo contiene solo `tuscany` e `lake-como`.
Questi due articoli sono preservati, ricevono metadata propri e rendono il
contenuto già nell'HTML iniziale. Non viene ipotizzata una migrazione da `toscana`
a `tuscany`. I collegamenti “Explore More Regions” ora puntano alle vere pagine
`/regions/...`, anziché ad articoli assenti.

## Sitemap, robots e link

- Rimosso soltanto l'alias `/regions/lombardy` dalla sitemap.
- Nessun URL aggiunto artificialmente.
- `robots.txt` invariato: accesso pubblico consentito e sitemap sul dominio ufficiale.
- Cinque articoli di viaggio ora collegano `/regions` direttamente, evitando `/regiony`.
- I valori `lombardy` ancora presenti nei filtri e nelle tabelle dati non sono
  automaticamente link all'alias: sono mantenuti per compatibilità dei filtri.

## File interessati

| File | Correzione |
| --- | --- |
| `proxy.js` | 301 per 373 prima della regola 410; documentazione 360/372 |
| `next.config.js` | 301 lombardy → lombardia |
| `app/about/layout.js` | Metadata e canonical specifici |
| `app/contact/layout.js` | Metadata e canonical specifici |
| `app/guides/layout.js` | Metadata e canonical specifici |
| `app/faq/layout.js` | Metadata e canonical specifici |
| `app/regions/layout.js` | Solo canonical della lista regioni |
| `app/process/layout.js` | Solo canonical della pagina esistente in sitemap |
| `app/gdpr/layout.js` | Solo canonical della pagina esistente in sitemap |
| `app/terms/layout.js` | Solo canonical della pagina esistente in sitemap |
| `app/regions/[slug]/layout.js` | Whitelist statica e notFound nei metadata e layout |
| `app/regions/[slug]/page.js` | Validazione prima della lettura immobili |
| `app/blog/regions/regionBlogData.js` | Inventario articoli estratto senza perdita di contenuto; link regionali canonici |
| `app/blog/regions/[slug]/layout.js` | Metadata e validazione server degli articoli effettivi |
| `app/blog/regions/[slug]/page.js` | Contenuto iniziale e link verso regioni esistenti |
| `app/sitemap.js` | Esclusione alias lombardy |
| `app/clanky/pruvodce-italii/jak-cestovat-po-italii-levne/page.js` | Link diretto /regions |
| `app/clanky/pruvodce-italii/kde-se-ubytovat-v-italii-levne/page.js` | Link diretto /regions |
| `app/clanky/pruvodce-italii/kolik-stoji-dovolena-v-italii-v-roce-2026/page.js` | Link diretto /regions |
| `app/clanky/pruvodce-italii/kolik-stoji-jidlo-v-italii-v-roce-2026/page.js` | Link diretto /regions |
| `app/clanky/pruvodce-italii/nejkrasnejsi-mala-mesta-v-italii/page.js` | Link diretto /regions |
| `scripts/check-technical-seo.cjs` | Controllo ripetibile HTTP, metadata, alias e sitemap completa |
| `audit-broken-links-report.md` | Risultato scansione link locali |
| `docs/technical-seo-audit.md` | Questo report |

## Ripetere i controlli

```powershell
npm test
npm run type-check
npm run check:encoding
npm run build
npm run start -- --port 3100
```

In un secondo terminale:

```powershell
node scripts/check-technical-seo.cjs http://localhost:3100
node scripts/audit-broken-links.cjs http://localhost:3100
```

Il primo build locale ha concluso con exit code 0, segnalando il tentativo
fallito di riparazione automatica del lockfile SWC perché Yarn non è disponibile.
Per il build finale è stata usata solo nella shell la variabile
`NEXT_IGNORE_INCORRECT_LOCKFILE=1`: nessuna modifica a dipendenze, lockfile o
configurazione di produzione. La versione Next installata localmente è 16.2.10.

## Limiti e problemi fuori da questo blocco

- 360 e 372 restano non identificati, intenzionalmente con 410.
- Gli altri alias regionali preesistenti rimangono 200 con canonical della regione;
  non sono in sitemap e non sono oggetto di nuovi redirect in questo intervento.
- Le normalizzazioni preesistenti HTTP/www/trailing slash possono comportare
  ulteriori passaggi per varianti non canoniche. I due nuovi redirect sugli URL
  richiesti sono diretti; non è una dichiarazione di assenza di catene su ogni
  variante storica. `/index.php?s=373` conserva il passaggio preesistente alla root.
- Non è stata riscritta la strategia title/description di altre pagine.
- Next 16.2.10 scrive `Internal: NoFallbackError` nel log locale quando si
  richiedono gli slug esclusi da `dynamicParams = false`. Le risposte verificate
  sono 404 (anche con user agent Googlebot), non 500 o 200. La diagnostica del
  framework resta da valutare separatamente; nessun aggiornamento di dipendenze
  è incluso in questo intervento.
- La verifica locale non sostituisce il controllo pubblico dopo un futuro deploy
  autorizzato; il sito pubblico resta invariato.

## Risultati finali

- `npm test`: 11 test superati, 0 falliti.
- `npm run type-check`: superato.
- `npm run check:encoding`: superato.
- Build di produzione finale: exit code 0; compilazione, TypeScript e
  generazione di 315 pagine completate, senza errori di build.
- `node scripts/check-technical-seo.cjs http://localhost:3100`: PASS.
  Verificati metadata/Open Graph, due redirect diretti, 410 mantenuti, 404 con
  browser e Googlebot, regioni valide e tutti gli alias precedentemente supportati.
- Tutti i 278 URL della sitemap: HTTPS, dominio ufficiale, nessuna query,
  nessun duplicato, stato 200, canonical self-referencing e assenza di noindex.
- Scansione dei link: 298 URL controllati, nessun link interno rotto rilevato.
  Copertura dei link HTML raggiungibili da homepage e sitemap; non equivale a
  esplorare ogni possibile stato autenticato o interazione JavaScript.
- Browser: homepage visualizzata correttamente; title ceco di `/about` corretto;
  `/?s=373` arriva a `/guides/costs` e lombardy arriva a lombardia; nessun errore
  JavaScript rilevato nelle verifiche effettuate.
- Gli articoli `tuscany` e `lake-como` rispondono 200 e il loro H1 reale è già
  presente nell'HTML iniziale, senza il precedente testo di errore transitorio.

Riferimenti tecnici: [notFound](https://nextjs.org/docs/app/api-reference/functions/not-found)
e [configurazione dei segmenti](https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config).
