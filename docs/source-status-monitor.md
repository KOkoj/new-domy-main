# Source Status Monitor

Questo progetto supporta ora il monitoraggio degli annunci importati da `immobiliare.it` tramite `sourceUrl`.

## Obiettivo

- Mostrare un ribbon sopra la foto quando un immobile e `sold` o `reserved`
- Controllare periodicamente gli URL esterni
- Aggiornare automaticamente lo `status` interno dell'immobile

## Logica attuale

- Se la pagina esterna contiene segnali espliciti di venduto, lo stato passa a `sold`
- Se la pagina esterna risulta non disponibile, 404, 410 o rediretta fuori dalla scheda annuncio, lo stato passa a `reserved`
- Se un immobile e gia stato impostato manualmente a `sold` o `reserved`, il monitor non lo riporta automaticamente a `available`

## Endpoint disponibili

### Cron pubblico protetto da secret

`GET /api/cron/source-status`

Uso previsto:

- chiamata periodica da cron server o Vercel
- header richiesto se `CRON_SECRET` e configurato:

```txt
Authorization: Bearer <CRON_SECRET>
```

Risposta:

- numero annunci controllati
- numero annunci aggiornati
- eventuali errori per URL non raggiungibili

### Test manuale admin

`POST /api/admin/source-status-check`

Richiede accesso admin.

Payload supportati:

```json
{
  "propertyId": "sanity-or-local-id"
}
```

oppure:

```json
{
  "sourceUrl": "https://www.immobiliare.it/annunci/123456789/",
  "persist": false
}
```

Note:

- `propertyId`: controlla un immobile gia presente in archivio
- `sourceUrl`: prova diretta su un URL senza bisogno che l'immobile sia gia salvato
- `persist: false`: esegue solo il test senza salvare modifiche

## Variabili ambiente

Da configurare in produzione:

```txt
CRON_SECRET=<segreto-lungo-casuale>
```

Se gli annunci vivono in Sanity e vuoi che il monitor salvi gli aggiornamenti li:

```txt
NEXT_PUBLIC_SANITY_PROJECT_ID=...
NEXT_PUBLIC_SANITY_DATASET=...
SANITY_API_TOKEN=...
```

Senza `SANITY_API_TOKEN`, il monitor aggiorna solo gli annunci nel fallback locale JSON.

## Esempi di test

### Test cron

```bash
curl -H "Authorization: Bearer <CRON_SECRET>" https://<dominio>/api/cron/source-status
```

### Test singolo URL senza persistenza

```bash
curl -X POST https://<dominio>/api/admin/source-status-check \
  -H "Content-Type: application/json" \
  -b "<cookie-session-admin>" \
  -d "{\"sourceUrl\":\"https://www.immobiliare.it/annunci/123456789/\",\"persist\":false}"
```

### Test singolo immobile salvando il risultato

```bash
curl -X POST https://<dominio>/api/admin/source-status-check \
  -H "Content-Type: application/json" \
  -b "<cookie-session-admin>" \
  -d "{\"propertyId\":\"<id-immobile>\"}"
```

## Scheduling consigliato

Frequenza consigliata iniziale:

- ogni 12 ore, se il volume annunci e moderato
- ogni 24 ore, se vuoi un carico piu conservativo

Per la pubblicazione possiamo poi collegare:

- Vercel Cron, oppure
- un cron esterno che colpisce l'endpoint protetto

## Limiti noti

- `immobiliare.it` puo cambiare HTML, testi o politiche anti-bot: in quel caso aggiorneremo i pattern
- l'euristica distingue tra `sold` e `reserved` in modo conservativo
- gli HAR saranno utili per affinare i segnali reali della pagina venduta/non disponibile
