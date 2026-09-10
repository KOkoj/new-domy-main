# Homepage e regions: riduzione HTML e inventario iniziale

Intervento locale del 9 settembre 2026, branch
`perf/home-regions-property-previews`. Nessun push o deploy.
Le modifiche SEO precedenti sono preservate.

## Causa e intervento

`app/page.jsx` e `app/regions/page.js` inviavano tutti i 231 immobili pubblici
ai rispettivi componenti client. `PropertySlider` trasformava i record solo
dopo il confine server/client e renderizzava 231 card, benché la viewport ne
mostrasse poche. Le descrizioni in tre lingue, le gallerie, le coordinate e
gli altri dati completi finivano quindi nel payload RSC senza essere usati
dalle card. Non c'erano 231 immobili editorialmente selezionati né un limite
iniziale del carosello.

Ora le due pagine preparano sul server 12 anteprime, nello stesso ordine:
immobili con pinnedRank, nuovi per data, altri per data. Il mapper preesistente
è stato estratto senza cambiarne la trasformazione o l'ordinamento, verificati
contro la copia precedente per tutti i 231 record. Le prime 12 destinazioni
nell'HTML sono esattamente le prime 12 precedenti.

Le card ricevono solo ID/slug, titoli e regione nelle tre lingue, prezzo e
valuta, camere, bagni, superficie, copertina, stato e badge. Le date e il rank
servono alla selezione sul server e vengono esclusi dalla proiezione finale.
Il JSON degli immobili passa da 1.399.285 a 7.434 byte (-99,47%).

Il markup `SlideCard` è identico. Il componente conserva il percorso precedente
per le pagine regionali e gli altri utilizzatori. L'elenco `/properties`, il
datastore, le API, la sitemap e il modello globale non sono stati modificati.
Non sono state introdotte API, paginazioni, librerie o conversioni massive in CSR.

## Cosa resta nell'HTML

- Contenuti SEO, titoli e testi editoriali delle due pagine.
- Tutti i link regionali e il relativo contenuto già presente.
- Dodici card complete con normali link HTML ai dettagli degli immobili.
- Link all'inventario completo, visibile anche su mobile.
- Canonical, metadata, H1 e JSON-LD originali.

Gli altri 219 immobili non sono più slide del carosello su homepage e regions;
restano raggiungibili dall'elenco completo, dalle pagine regionali e dalla
sitemap. È una preview limitata, non un caricamento automatico dell'intero
inventario dopo l'hydration. Non occorre JavaScript per seguire i link già
presenti nell'HTML. La sitemap continua a elencare tutti i 231 immobili pubblici.

## Misurazioni prima/dopo

Build di produzione Next.js 16.2.10, ambiente locale. Byte non compressi.
DOM = elementi nell'HTML server analizzato con DOMParser, prima dell'hydration;
non è il conteggio dei text node. Payload RSC = script `self.__next_f.push`
incorporati nell'HTML, non una misura separata del protocollo Flight.
La misura finale bypassa la cache del browser con `cache: 'no-store'`.

| Pagina | HTML byte prima → dopo | Riduzione HTML | DOM prima → dopo | Immagini prima → dopo | RSC byte prima → dopo |
| --- | --- | --- | --- | --- | --- |
| `/` | 2.346.122 → 161.051 | 93,14% | 8.224 → 1.141 | 244 → 25 | 1.492.586 → 19.622 |
| `/regions` | 2.451.179 → 266.108 | 89,14% | 8.635 → 1.552 | 254 → 35 | 1.505.197 → 32.233 |
| `/properties` | 649.624 → 649.624 | 0% | 869 → 869 | 14 → 14 | 511.566 → 511.566 |

Riduzione DOM: homepage 86,13%, regions 82,03%.
Riduzione immagini: homepage 89,75%, regions 86,22%.
Riduzione RSC: homepage 98,69%, regions 97,86%.

| Pagina | JS referenziato byte prima → dopo | File JS prima → dopo | Immobili serializzati prima → dopo | Card iniziali prima → dopo |
| --- | --- | --- | --- | --- |
| `/` | 1.369.574 → 1.369.643 | 25 → 25 | 231 → 12 | 231 → 12 |
| `/regions` | 1.382.684 → 1.382.752 | 25 → 25 | 231 → 12 | 231 → 12 |
| `/properties` | 1.298.631 → 1.298.631 | 23 → 23 | 231 → 231 | 12 → 12 |

Il JS referenziato è la somma non compressa dei file script unici della pagina:
non viene presentato come JS effettivamente eseguito. Nessuna riduzione
significativa del bundle; i +69/+68 byte sono trascurabili. Il numero totale
di richieste non è confrontato perché dipende da viewport, scroll e cache.
Preload immagini invariati: 3 homepage, 8 regions, 3 properties.

Valori strutturati in `home-regions-performance-metrics.json`.
Misura ripetibile con `scripts/measure-page-payload.browser.js`, eseguito in
una pagina locale tramite `agent-browser eval --stdin`.

## Verifiche

- `npm test`: 22/22 passati.
- Type-check e controllo encoding passati; verifica UTF-8 anche sui nuovi file.
- Production build passata; `git diff --check` passato.
- Canonical, title, description, H1, JSON-LD, testi esterni al carosello e
  link regionali identici alla baseline sulle tre pagine misurate.
- Homepage e regions sotto 1 MB; prime 12 card nello stesso ordine precedente.
- `/properties` invariato anche in HTML, DOM, immagini, RSC e JS.
- SEO HTTP: 280 URL sitemap 200, canonici e indicizzabili; robots e precedenti
  redirect/410/404 conservati.
- Scansione di 280 pagine e 9.187 link interni superata.
- Property HTTP: 20 disponibili e 2 venduti 200; 12 inesistenti 404/noindex,
  senza canonical; controlli browser, Googlebot, RSC e API superati.
- Browser desktop/mobile: screenshot prima/dopo di homepage e regions,
  hero e CTA conservati, stesso layout delle card. Le frecce del carosello
  spostano le slide e attivano il ritorno; 12 immagini del carosello lazy.
- CTA mobile del carosello conduce all'elenco completo; filtro Toscana +
  villa restituisce gli otto risultati coerenti; nessun overflow a 390 px.
- Toscana, Lombardia e Abruzzo verificate nel browser mobile: testi, H1 e
  link immobili presenti, nessun overflow orizzontale.
- Nessun errore JavaScript rilevato nella sessione di verifica.

## File del blocco

1. `app/page.jsx`: prepara e invia la preview server della homepage.
2. `app/HomePageClient.jsx`: inoltra le anteprime al carosello.
3. `app/regions/page.js`: prepara e invia la preview server di regions.
4. `app/regions/RegionsListingClient.jsx`: inoltra le anteprime al carosello.
5. `components/PropertySlider.jsx`: accetta le card già preparate, conserva il
   comportamento precedente per gli altri utilizzatori.
6. `lib/propertySliderData.js`: mapper/ordinamento estratti e preview da 12 card.
7. `tests/property-slider-preview.test.cjs`: ordinamento, limiti, dati di card,
   stati e inventari piccoli, assenza di mutazioni dell'inventario.
8. `scripts/measure-page-payload.browser.js`: misura HTML/DOM/RSC/JS e dati SEO.
9. `docs/home-regions-performance-metrics.json`: valori prima/dopo.
10. `docs/home-regions-performance.md`: questo report.

## Limiti e lavoro non incluso

Il JavaScript complessivo resta circa 1,3 MB non compresso. I componenti pagina
continuano a richiedere il client per lingua, stato, effetti ed eventi; non è
stata intrapresa una riscrittura dei confini server/client. Le sezioni archiviate
della homepage non vengono renderizzate e non sono state ripulite in questo blocco.

Le card regionali hanno ancora markup responsive parzialmente duplicato,
conservato per non cambiare layout o contenuti editoriali. Non era la causa
dominante del peso. Non sono state aggiunte Suspense o sezioni vuote differite.
Non risultavano enormi ItemList da ridurre su queste due pagine.

`PropertyImage` conserva il bypass dell'ottimizzatore già motivato nel progetto
dal precedente esaurimento della quota: non viene riattivato globalmente né
modificata la qualità. Le immagini originali possono ancora essere grandi,
ma ora le due pagine ne includono molte meno. Hero/preload e fallback restano
invariati. Nessuna misurazione Lighthouse/Core Web Vitals in produzione:
non si attribuiscono miglioramenti LCP/INP non misurati.

Verdetto: **A. SAFE TO MERGE** per questo intervento locale.
