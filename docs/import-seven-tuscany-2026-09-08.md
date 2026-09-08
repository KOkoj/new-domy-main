# Seven Tuscany listings ? 2026-09-08

Imported from the seven user-supplied HAR captures. Raw HAR files, cookies and request headers are not committed. Each property folder contains extracted source metadata and the exact local-to-source image mapping.

| HAR | Property | Price EUR | Photos | Original listing |
| --- | --- | ---: | ---: | --- |
| 1.har | Renovated rustic house with garden in Quiesa | 270000 | 14 | https://www.immobiliare.it/annunci/132061064/ |
| 2.har | Sea-view village house in Solaio, Pietrasanta | 292000 | 9 | https://www.immobiliare.it/annunci/127378181/ |
| 3.har | Stone house with land in Pieve di Compito | 295000 | 71 | https://www.immobiliare.it/annunci/128377910/ |
| 4.har | Panoramic village house with patio in Sommocolonia, Barga | 290000 | 31 | https://www.rightmove.co.uk/properties/90676764 |
| 5.har | Stone village house with garden in Valpromaro | 320000 | 24 | https://www.immobiliare.it/annunci/130818992/ |
| 6.har | Il Capriccio: village home in Celle dei Puccini, Pescaglia | 235000 | 35 | https://www.risorseimmobiliari.it/lucca/vendita-rustico-casale-pescaglia-5119267.html |
| 7.har | Renovated former mill in Valdottavo | 250000 | 27 | https://www.immobiliare.it/annunci/129179200/ |

Review notes:

- The existing 225 property objects are unchanged; seven unique slugs are added.
- All 211 gallery photos decode successfully and exist in the public property folders. Cover images were visually inspected.
- Source pages were available at verification; Rightmove was verified by direct HTTP 200 with the matching title.
- Pescaglia uses the two-bedroom/two-bathroom unit described in the text, with an explicit discrepancy note; the detached shared land is not described as a private adjoining garden.
- Valpromaro states both surface figures and the conflicting bedroom counts.
- Valdottavo does not claim parking: the source contradicts itself and this is disclosed in all three languages.
- Capannori describes the second unit as unfinished and conversion possibilities as requiring verification.
- The existing bundled-first property workflow publishes these additions and preserves database-only admin records. No database snapshot is applied.
