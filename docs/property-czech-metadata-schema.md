# Metadata e schema delle schede immobili

Verifica locale del 9 settembre 2026, branch `fix/property-czech-metadata-schema`.
Nessun push, deploy, cambiamento DNS o aggiornamento dei dati immobiliari.

## Problemi e causa

L'HTML delle schede dichiarava già `lang="cs"`, ma sia il layout di dettaglio
sia `buildPropertyJsonLd` richiedevano esplicitamente i campi inglesi (`en`).
Anche il fallback della description era inglese. Il JSON-LD dichiarava
`inLanguage: en`, con breadcrumb Home → Properties → immobile.

Il layout comune `app/properties/layout.js` renderizzava l'ItemList dell'indice
(50 elementi, numero totale 231) e il relativo breadcrumb su tutti i figli.
Ogni dettaglio conteneva quindi un'ItemList estranea e due BreadcrumbList:
quello dell'indice e quello specifico incorporato nel RealEstateListing.

I canonical e il routing erano già corretti e sono stati preservati.
L'immagine social non usava un resolver robusto per oggetti immagine/Sanity
e per immagini assenti; il nuovo codice usa la logica già presente nel progetto.

## Logica finale

- Title: `seoTitle.cs`, altrimenti `title.cs`, seguito dal nome del sito una
  sola volta. I titoli cechi esistenti non vengono riscritti. Verificata
  l'unicità nell'intero inventario locale.
- In assenza di entrambi i titoli cechi: tipo in ceco e indirizzo/località
  disponibili, altrimenti `Nemovitost – Itálie`. Non si ricicla prosa inglese.
- Description: `seoDescription.cs`, altrimenti `description.cs`, con spazi
  normalizzati, markup eliminato e limite di 160 caratteri senza spezzare una
  parola quando possibile. Il fallback usa soltanto tipo, località, superficie
  e prezzo EUR effettivamente disponibili, con una frase neutra in ceco.
- Nomi propri e località sono mantenuti dai dati esistenti; nessuna traduzione
  automatica o riscrittura dei dati del record.
- Canonical e og:url: HTTPS, www, slug definitivo del record, senza query.
- OG/Twitter condividono title e description; OG usa `website` e `cs_CZ`.
- Copertina risolta con `getPropertyImageList`, che rispetta mainImage e gli
  oggetti immagine. URL assoluti. Se assente, i social usano l'immagine già
  esistente del sito `/hero-background.webp`, mai un altro immobile.
- Nessuna immagine viene aggiunta. Il fallback del sito non viene spacciato
  per fotografia dell'immobile nel JSON-LD: lì image viene omesso se assente.

## Structured data prima/dopo

| Elemento | Prima | Dopo |
| --- | --- | --- |
| Organization globale | Presente | Conservata |
| WebSite globale | Presente | Conservato |
| ItemList dell'indice nel dettaglio | 1 | 0 |
| BreadcrumbList nel dettaglio | 2 | 1, specifica e incorporata nel listing |
| RealEstateListing | 1, inglese | 1, ceco, solo record corrente |
| inLanguage del listing | en | cs |
| Breadcrumb | Home → Properties → immobile | Domů → Nemovitosti → immobile |
| URL schema | Canonical del record | Stesso canonical |
| Venduti | SoldOut | SoldOut, pagina 200 indicizzabile |

L'ItemList e il breadcrumb dell'indice sono stati trasferiti nella sola pagina
`/properties`, senza cambiarne i dati o il contenuto visibile. Il layout comune
mantiene metadata e revalidate già esistenti, ma non inietta più gli schema.

Il listing descrive la pagina e `about` l'immobile: indirizzo, coordinate,
superficie e numero di locali/camere/bagni sono collocati su tale entità.
I numeri non finiti, negativi o assenti vengono omessi. Zero camere separate
resta zero quando dichiarato, come nel monolocale di Bologna. Coordinate zero
valide non vengono scartate automaticamente. Gli intervalli geografici sono
controllati. Nessun prezzo o misura viene inventato.

Offer viene emesso solo con prezzo positivo valido in EUR (valuta predefinita
già utilizzata dal progetto): available → InStock, sold → SoldOut,
reserved → LimitedAvailability. Uno stato sconosciuto non viene dichiarato
automaticamente disponibile. Una valuta diversa non viene convertita o
ridenominata EUR: in quel caso l'offerta numerica viene omessa.

Riferimenti tecnici: [RealEstateListing](https://schema.org/RealEstateListing),
[Accommodation](https://schema.org/Accommodation),
[Next.js metadata](https://nextjs.org/docs/app/api-reference/functions/generate-metadata).
L'uso di Schema.org non costituisce una promessa di rich result Google.

## Campione e risultati

Baseline HTTP raccolta prima delle modifiche: 20 disponibili, 2 venduti,
monolocale Bologna, Montelupo senza immagini e alias Pescara. Sono stati
conservati HTML, metadata e JSON-LD originali per il confronto.

Il campione dei 20 disponibili comprende quattro record senza il campo rooms:
Quiesa, Pieve di Compito, Sommocolonia e Valpromaro. In questi casi
numberOfRooms viene omesso. Montelupo Fiorentino non ha immagini: metadata
con fallback del sito, listing senza immagini inventate. Esiste una sola
scheda senza immagini nell'inventario analizzato; non ne è stata creata un'altra
artificialmente. Ulteriori due fixture isolate coprono dati assenti e non validi.

- 24 schede reali verificate in HTTP con user agent browser e Googlebot:
  tutte 200, lang cs, metadata cechi, self-canonical, OG coerente,
  un listing, un breadcrumb, nessuna ItemList estranea.
- Due venduti: Chianciano Terme/Cavine Valli e Venzone, entrambi 200,
  indicizzabili, canonical corretto e SoldOut.
- Alias Pescara: 301 diretto verso il primary, che resta 200.
- Cinque slug inesistenti richiesti: 404, noindex, nessun canonical,
  RealEstateListing o ItemList; riconfermati anche dagli altri 12 casi del test
  property HTTP precedente.
- Confronto prima/dopo: testi visibili, H1, immagini HTML, link e campi dei
  moduli delle 24 schede identici. Anche homepage, regions e indice mantengono
  metadata, schema e contenuti precedenti.
- API inventario identica. Sitemap: stessi 280 URL e stessi attributi,
  esclusi i lastmod generati al momento della build dalla logica preesistente.
- Browser: galleria Zoncolan aperta con 26 foto, link mappa presente,
  stesso contenuto e H1, nessun errore JavaScript rilevato.

Valori title, description, canonical e riepilogo social/schema delle 24 schede
sono registrati in `property-seo-verification.json`.

## Build e test

- `npm test`: 25/25, inclusi i tre nuovi test property SEO.
- `npm run type-check`: passato.
- `npm run check:encoding`: passato durante la build; nuovi file verificati
  anche con decoder UTF-8 rigoroso.
- `npm run build`: produzione Next.js 16.2.10, passata.
- `check-property-seo.cjs`: passato, confronto HTTP con baseline.
- `check-property-http.cjs`: 20 disponibili, 2 venduti, 12 inesistenti,
  browser/Googlebot, RSC e API passati.
- `check-technical-seo.cjs`: metadata, legacy, regioni, robots e tutte le
  280 URL canoniche della sitemap passati.
- `check-standalone-seo.cjs`: 280 pagine e 9.187 link interni passati.
- `git diff --check`: passato.

## File modificati in questo blocco

1. `app/properties/[slug]/layout.js`: metadata dal nuovo helper ceco;
   stesso caricamento dati e routing.
2. `lib/seo/propertySeo.js`: selezione testo ceco, fallback, numeri e immagini.
3. `lib/seo/contentSeo.js`: solo builder property corretto per lingua e campi;
   builder degli articoli e breadcrumb generico preservati.
4. `app/properties/layout.js`: schema dell'indice rimosso dal layout condiviso.
5. `app/properties/PropertiesIndexSchema.jsx`: schema preesistente dell'indice.
6. `app/properties/page.js`: rende lo schema soltanto sull'indice.
7. `tests/property-seo.test.cjs`: inventario, dati incompleti e fallback.
8. `scripts/check-property-seo.cjs`: verifiche HTTP e confronto contenuti.
9. `docs/property-seo-verification.json`: risultati del campione.
10. `docs/property-czech-metadata-schema.md`: questo report.

## Limiti e verdetto

I doppi H1 preesistenti sono intenzionalmente invariati, come richiesto.
Nessun intervento editoriale globale sulle traduzioni ceche archiviate: viene
corretta la selezione della lingua mantenendo i titoli e le informazioni
esistenti. Il fallback social usa il visual esistente del sito; non è stata
creata una nuova immagine Open Graph.

Nessuna regressione rilevata nei controlli eseguiti. Verifiche locali:
non è stato eseguito un deploy né un controllo Search Console successivo.

**Verdetto: A. SAFE TO MERGE.**
