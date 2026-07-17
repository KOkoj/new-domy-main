# Production recovery audit — 2026-07-17

## Verified counts

- Official domain `www.domyvitalii.cz`: 184 properties (`available`: 184)
- Latest accessible Vercel deployment: 216 properties
- Local bundled dataset: 216 properties (`available`: 215, `sold`: 1)
- Latest GitHub-backed deployment: 201 properties
- Properties present locally but missing from the official domain: 32
- Properties present on the official domain but absent locally: 0

## Root cause evidence

- The accessible Vercel project is `new-domy-main` (`prj_HqzCXPZnpoZKmPmeD9jHvnov9RCJ`).
- That project does not list `www.domyvitalii.cz` among its domains.
- Looking up `www.domyvitalii.cz` as a Vercel project returns `401 Unauthorized`.
- DNS points `www.domyvitalii.cz` to `7ca78e8b8fcfbfa9.vercel-dns-017.com`.
- Therefore the official domain is attached to a different Vercel project/account or scope.

## Missing from the official domain

### Added locally on 8 July 2026 (15)

1. `toscana-terratetto-pontassieve-santa-brigida`
2. `toscana-appartamento-massa-marittima-albizzeschi`
3. `toscana-bilocale-tatti-massa-marittima-posta-vecchia`
4. `toscana-appartamento-chianciano-terme-cavine-valli`
5. `calabria-villino-panoramico-badolato`
6. `calabria-casa-lamezia-terme-vico-vetriera`
7. `calabria-casa-panoramica-sellia-verdi`
8. `calabria-villa-san-lucido-ss18`
9. `calabria-casa-fiumefreddo-bruzio-piano-san-salvatore`
10. `calabria-casa-ristrutturata-rovito-san-nicola`
11. `calabria-casa-belvedere-marittimo-laise`
12. `toscana-trilocale-montevarchi-moncioni`
13. `toscana-trilocale-montevarchi-marconi`
14. `toscana-terratetto-cascina-san-casciano-filicaia`
15. `toscana-quadrilocale-san-giuliano-terme-20-settembre`

### Present in the 201-property deployment but missing from official production (17)

1. `puglia-casa-indipendente-triggiano-via-tito-fanfulla`
2. `puglia-appartamento-monopoli-viale-aldo-moro`
3. `puglia-villa-mola-di-bari-strada-provinciale-mola-conversano-per-villa-pepe`
4. `puglia-villa-conversano-viale-discesa-del-monte`
5. `puglia-casa-indipendente-bari-via-de-marinis`
6. `calabria-villa-francavilla-marittima-via-sant-emiddio-21`
7. `calabria-villa-praia-a-mare-localita-laccata`
8. `campania-casa-indipendente-ascea-via-grisi-s-n-c`
9. `calabria-villa-san-nicola-arcella-villaggio-del-bridge`
10. `campania-villa-torchiara-parco-elena`
11. `campania-villa-casal-velino-via-ardisani-s-n-c`
12. `campania-villa-camerota-contrada-conca-dei-vascelli`
13. `calabria-appartamento-cassano-all-ionio-via-giovanni-amendola-136`
14. `campania-appartamento-rutino-via-dei-mille`
15. `campania-villa-centola-via-velardino`
16. `friuli-venezia-giulia-appartamento-zoncolan-la-dane`
17. `friuli-venezia-giulia-villa-ravascletto-via-nazionale`

## GitHub content status

The `master` branch currently ends at `fa8c6762615ab2b0c1259d4a466150539f46375f`.
Compared with `aad17fee4b79b2db8636c80a5423a93fdc044919`, GitHub retains:

- building-irregularities article and SEO registration;
- article header image;
- homepage yellow-D logo;
- inquiry email fixes;
- related navigation/blog/guide updates.

The 15 listings dated 8 July are present locally and in the latest direct
deployment, but no matching GitHub commit was found.

## Safe recovery target

The recovery target is the 216-property local dataset plus the current GitHub
`master` content, including the Venzone listing marked `sold`. Do not roll back
the accessible project to the 201-property deployment because that would lose
the 15 listings dated 8 July.
