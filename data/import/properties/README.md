# Import annunci proprieta

Questa cartella serve per creare annunci in automatico.

## Struttura cartelle

Crea una cartella per ogni immobile:

`data/import/properties/<slug-annuncio>/`

Dentro ogni cartella metti:

1. `listing.json` (obbligatorio)
2. `images/` con foto `.jpg`, `.jpeg`, `.png`, `.webp`, `.avif` (facoltativo ma consigliato)

Esempio:

`data/import/properties/villa-noto/listing.json`

`data/import/properties/villa-noto/images/01.jpg`

`data/import/properties/villa-noto/images/02.jpg`

## Campi minimi in listing.json

```json
{
  "title_it": "Villa panoramica con piscina a Noto",
  "propertyType": "villa",
  "region_it": "Sicilia",
  "city_it": "Noto",
  "address_it": "Contrada San Lorenzo, Noto",
  "price": 780000,
  "rooms": 6,
  "bedrooms": 4,
  "bathrooms": 3,
  "square_meters": 250,
  "features": ["Piscina", "Vista mare", "Giardino", "Posto auto"]
}
```

## Campi utili opzionali

- `title_en`, `title_cs`
- `description_it`, `description_en`, `description_cs`
- `rooms` (totale locali, separato da `bedrooms`)
- `keywords` (array o stringa separata da virgole)
- `status` (`available`, `reserved`, `sold`)
- `featured` (`true`/`false`)
- `source_url`
- `lat`, `lng`
- `yearBuilt`, `lotSize`, `parking`
- `image_urls` (array URL, usato solo se non ci sono file in `images/`)
  - Attenzione: devono essere URL diretti immagine (`.jpg`, `.png`, `.webp`, ecc.). Link pagina tipo `.../annunci/...#foto1` vengono ignorati.

## Come importare

Comando standard:

`node scripts/import-properties.cjs --replace`

- `--replace`: sostituisce gli annunci esistenti (utile nel tuo caso, visto che quelli attuali sono da eliminare)
- `--dry-run`: controlla i file senza scrivere nulla
- `--no-ai`: non usa AI per descrizioni/traduzioni
- `--only=<nome-cartella>`: importa una sola proprieta

## Risultato import

- Le foto vengono copiate in `public/uploads/properties/<slug>/...`
- Gli annunci vengono salvati in `data/local-properties.json`
- Le traduzioni (EN/CS) e la descrizione possono essere generate automaticamente se c'e `OPENAI_API_KEY`
