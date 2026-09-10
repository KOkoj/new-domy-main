# Consolidamento immobile Pescara — 9 settembre 2026

Intervento locale sul branch `fix/pescara-property-duplicate`. Nessun push,
deploy, aggiornamento remoto dei dati o modifica infrastrutturale.
Le modifiche dei blocchi SEO precedenti sono conservate.

## Identità e confronto prima dell'intervento

Fonte condivisa: https://www.immobiliare.it/annunci/127611620/.
L'ID esterno 127611620 è ricavato dall'URL; non esiste un campo sourceId
separato nei due record. L'annuncio originale conferma Via Teramo a Pescara,
139 m², quattro locali, due camere, un bagno, primo piano, ascensore e terrazza.
Le fotografie mostrano gli stessi ambienti e la stessa terrazza: identità
confermata con elevata confidenza, non dedotta soltanto dal prezzo.

P = primary `abruzzo-appartamento-pescara-via-teramo`.
S = secondary `abruzzo-quadrilocale-pescara-via-teramo`.

| Campo | P | S |
| --- | --- | --- |
| ID | local-import-abruzzo-appartamento-pescara-via-teramo-1775821774941-xvtwy | local-import-abruzzo-quadrilocale-pescara-via-teramo-1778352000530-ooha9 |
| Tipo record / immobile | listing / apartment | Uguale |
| Titolo IT | Quadrilocale con terrazza abitabile nel centro di Pescara | Quadrilocale a Pescara in via Teramo |
| Titolo EN | Four-Room Apartment with Large Terrace in Central Pescara | Four-Room Apartment in Pescara, Via Teramo |
| Titolo CS | Čtyřpokojový byt s velkou terasou v centru Pescary | Čtyřpokojový byt v Pescare, Via Teramo |
| Prezzo locale | 260000 EUR | Uguale |
| Superficie / locali / camere / bagni | 139 / 4 / 2 / 1 | Uguale |
| Indirizzo EN/CS/IT | Via Teramo, Pescara (PE), Abruzzo | Via Teramo, Pescara |
| Regione / comune | Abruzzo / Pescara, slug pescara | Uguale |
| Provincia | PE nell'indirizzo, nessun campo autonomo | Nessun campo autonomo |
| Coordinate | 42.4666, 14.2092 | Uguali; non considerate prova indipendente |
| Piano | Primo piano e ascensore nella descrizione/caratteristiche | Non specificato |
| Descrizione | EN 731, CS 705, IT 794 caratteri; distribuzione, cucina abitabile, terrazza, balcone, camere e personalizzazione | EN 529, CS 542, IT 594; presentazione generica, dimensioni, prezzo e consigli di verifica |
| Caratteristiche | Sei, con dettagli specifici degli ambienti e dell'edificio | Sei, principalmente riepilogo dei dati strutturati e zona centrale vicino alla stazione |
| Stato / featured | available / false | Uguale |
| Immagini | 3 JPEG validi, da 320×240 a 1024×768 | 14 JPEG validi, 13 hash unici; immagini grandi e planimetria |
| Copertina | mainImage 0 | mainImage 0 |
| Creazione e aggiornamento | 2026-04-10T11:49:34.940Z | 2026-05-09T18:40:00.529Z |
| SEO | Title/description EN, CS, IT specifici, con terrazza | Title/description EN, CS, IT più generici, con prezzo |
| Keywords | pescara; via teramo; quadrilocale; terrazza abitabile; zona centrale; abruzzo | abruzzo; pescara; apartment; via-teramo; immobiliare-it |
| Riferimenti verificati in sola lettura | 1 favorite, 1 inquiry | 0 favorite, 0 inquiry |

I conteggi dei riferimenti riguardano le tabelle favorites.listing_id e
inquiries.listingId nell'ambiente configurato, cercando ID e slug. Nessun dato
personale è stato esportato, nessuna riga modificata. I record immobili non
contengono altri ID lead/favorite/reference espliciti.

Il primary è scelto per la maggiore completezza delle informazioni specifiche
dell'immobile. Conserva inoltre riferimenti già esistenti e maggiore anzianità.
Il vantaggio fotografico del secondary viene consolidato nel primary.

## Dati consolidati e conservati

È cambiato esclusivamente il campo images del primary: 3 → 13 immagini.
Le tre immagini già presenti, copertina compresa, restano invariate.
Dieci immagini del secondary vengono copiate senza ricodifica nella directory
pubblica del primary, con prefisso `legacy-`:

`01-gallery-1`, `02-gallery-10`, `03-gallery-11`, `04-gallery-12`,
`06-gallery-3`, `07-gallery-4`, `10-gallery-7`, `11-gallery-8`,
`12-gallery-9`, `14-plan` (tutte `.jpg`).

Non vengono ripetute nella galleria le viste `05-gallery-2`, `08-gallery-5`,
`09-gallery-6`, già rappresentate dalle tre immagini del primary. `13-main`
è una copia byte-identica di `01-gallery-1`. Tutti gli originali rimangono
nelle directory del secondary e nel materiale d'importazione. Non si perdono
le versioni a maggiore risoluzione, che restano disponibili negli originali.

Il secondary resta fisicamente nel dataset con tutti i campi originali.
Nessun altro record viene modificato; nessun ID viene cancellato o riscritto.
Prezzo, testi, metadata, stato, coordinate e date del primary restano invariati.

## Alias, output pubblico e link

`data/property-aliases.json` registra esclusivamente questa coppia verificata.
`getAllProperties` esclude il secondary prima dei filtri, anche dopo merge con
Sanity e anche se viene reimportato con lo stesso slug ma un nuovo ID.
Homepage, elenco, regioni, ricerca, filtri e ItemList usano questa raccolta
comune; non occorre modificare i singoli layout o la sitemap.

Lo slug e l'ID secondari sotto `/properties/` restituiscono 301 diretto verso
`/properties/abruzzo-appartamento-pescara-via-teramo`, anche con slash finale
e query. Le query vengono conservate; il canonical della destinazione è pulito.
La normalizzazione 308 dello slash per gli altri URL viene mantenuta dopo
gli alias: evita il precedente passaggio intermedio 308 prima del 301.
Proxy gestisce anche lo slug secondario codificato.

Il lookup API dello slug/ID storico restituisce il primary; il datastore
amministrativo conserva il record storico. I preferiti risolvono l'eventuale
ID secondario al primary senza migrare né cancellare righe.
Non risultavano link hardcoded al secondary nei componenti pubblici: i link
generati sono corretti tramite l'output dati comune. Il riferimento nello
script storico del 9 maggio viene conservato come provenienza dell'import.

Canonical finale:
`https://www.domyvitalii.cz/properties/abruzzo-appartamento-pescara-via-teramo`.
Title HTTP invariato:
`Four-Room Apartment with Terrace for Sale in Central Pescara | Domy v Itálii`.
Description EN nel record invariata:
`139 sqm apartment in Pescara: 4 rooms, 2 bedrooms, 1 bathroom, wraparound balcony, and livable terrace.`

## Origine della duplicazione e prevenzione futura

L'importatore `scripts/import-properties.cjs` riconosce gli esistenti tramite
slug.current e controlla gli slug del singolo batch. La sorgente 127611620
è stata importata ad aprile e poi nuovamente con uno slug diverso dallo script
`scripts/prepare-2026-05-09-har-listings-b.cjs`. L'upsert Supabase usa l'ID
interno. Non esiste una protezione equivalente sull'identità della sorgente.

Intervento futuro raccomandato: ricavare una chiave normalizzata
provider + external ID, verificarla contro inventario e batch prima della
creazione e dell'upsert, proponendo aggiornamento/riconciliazione anziché un
nuovo record. Usare source URL normalizzato come fallback e richiedere revisione
per segnali deboli. L'importatore non è stato riscritto in questo blocco.
Un terzo slug diverso per questa sorgente richiederebbe ancora tale protezione:
l'alias attuale impedisce il ritorno dei due slug noti come due schede pubbliche.

## POSSIBILI DUPLICATI DA VERIFICARE

Nessun'altra coppia individuata fra i 232 record, confrontando source ID
normalizzato per provider, source URL senza query/slash, indirizzo/prezzo/m²,
città/prezzo/m² e hash SHA-256 delle immagini locali.
Controllati 2051 riferimenti immagine dopo il consolidamento, tutti presenti;
l'unico gruppo con immagini identiche fra record è la coppia trattata.
La sovrapposizione visiva è stata verificata per Pescara; non è stato eseguito
un riconoscimento visivo completo di tutte le immagini dell'inventario.
L'assenza di altri candidati non dimostra che ogni inserzione sia unica.

## Verifica locale

File di questo blocco (21, comprese le dieci immagini elencate sopra):

- `data/local-properties.json`: aggiunta della galleria mancante al primary.
- `data/property-aliases.json`: identità della coppia verificata.
- `lib/propertyAliases.js`: risoluzione di slug e ID storici.
- `lib/propertyApi.js`: esclusione pubblica del secondary e lookup al primary.
- `next.config.js`: 301 prima della normalizzazione dello slash.
- `proxy.js`: risoluzione anche degli alias codificati.
- `app/dashboard/favorites/page.js`: associazione dei preferiti storici al primary.
- `tests/property-aliases.test.cjs`: conservazione dati, esclusione e lookup.
- `tests/property-404-proxy.test.cjs`: aggiornamento della dipendenza nel test isolato.
- `scripts/check-pescara-duplicate.cjs`: verifica HTTP e confronto prima/dopo.
- `docs/pescara-property-consolidation.md`: questo report.

Risultati:

- `npm test`: 20/20.
- `npm run type-check`: passato.
- `npm run check:encoding`: passato; diff senza errori whitespace.
- `npm run build`: produzione Next.js 16.2.10, passato.
- `check-pescara-duplicate.cjs`: 301 diretti, slash/query/ID/encoding,
  browser e Googlebot, primary 200/self-canonical/RealEstateListing,
  galleria 13 immagini HTTP 200, API e raccolte pubbliche.
- Confronto inventario HTTP prima/dopo: 232 → 231; tutti gli altri record
  identici; il primary differisce soltanto nella galleria.
- Sitemap 281 → 280: rimossa esclusivamente la URL secondaria; primary una volta.
- `check-property-http.cjs`: 20 disponibili e 2 venduti 200; 12 inesistenti
  404/noindex senza canonical o RealEstateListing; browser/Googlebot e RSC.
- `check-technical-seo.cjs`: legacy 301 e 410, regioni, canonical, robots e
  tutte le 280 URL canoniche della sitemap passati.
- `check-standalone-seo.cjs`: policy metadata precedenti conservate;
  280 pagine e 9625 link interni controllati.
- Browser: ingresso dal secondary con slash arriva al primary, galleria
  apribile con 13 elementi, nessun errore JavaScript rilevato.

Durante i test negativi di regioni/blog il server scrive `NoFallbackError`;
le relative risposte HTTP restano le 404 attese. Le route interessate non sono
state modificate in questo blocco; nessuna risposta 5xx rilevata nei controlli.

### Dato preesistente da verificare separatamente

La fonte originale, consultata durante l'analisi, ora mostra 199000 EUR
(aggiornamento annuncio 30 luglio 2026), contro 260000 EUR nei due record locali.
Il prezzo non viene aggiornato arbitrariamente in un intervento di deduplicazione.
Anche il conteggio dei piani dell'edificio non è univoco nella fonte attuale:
non sono stati aggiunti nuovi dati tecnici basandosi su tale discrepanza.

Verdetto per questo consolidamento: **A. SAFE TO MERGE**.
