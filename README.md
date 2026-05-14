# Rain Alert

Rain Alert is een open-source mobiele webapp/PWA die gebruikers een locatie laat kiezen en een pushmelding stuurt wanneer regen binnen een ingestelde waarschuwingstijd wordt verwacht.

Primaire databron: [KNMI Data Platform - Precipitation 5 minute radar nowcast over The Netherlands up to 2 hours ahead](https://dataplatform.knmi.nl/dataset/radar-forecast-2-0). Fallback: [Open-Meteo](https://open-meteo.com/). Buienradar is alleen als expliciete demo-provider voorbereid.

## Stack

- Next.js, React, TypeScript, Tailwind CSS
- Leaflet kaart
- Web Push API met VAPID keys
- MailerSend voor optionele e-mailalerts
- Modulaire `WeatherProvider` architectuur
- Prisma schema voor PostgreSQL/Supabase Postgres
- Supabase Storage voor optionele gedeelde KNMI-rastercache
- In-memory store voor lokale MVP zonder databaseconfiguratie
- Scheduler/cron endpoint voor periodieke regenchecks

## KNMI implementatie

De KNMI-provider gebruikt dataset `radar_forecast` versie `2.0` via de Open Data API:

```text
GET https://api.dataplatform.knmi.nl/open-data/v1/datasets/radar_forecast/versions/2.0/files
Authorization: <KNMI_API_KEY>
```

Daarna maakt de provider een tijdelijke download-URL voor de nieuwste file:

```text
GET /datasets/radar_forecast/versions/2.0/files/{filename}/url
```

De dataset is HDF5. Volgens de actuele KNMI/data.overheid metadata bevat hij 25 tijdstappen van +0 tot +120 minuten. De rasterwaarde is een neerslagsom per 5 minuten; Rain Alert rekent om naar mm/uur met `waarde * 12`.

Voor productie moet `h5wasm` beschikbaar zijn en kan `KNMI_HDF5_DATASET_PATH` worden gezet wanneer de numerieke dataset niet automatisch gevonden wordt. `KNMI_GRID_BOUNDS` is configureerbaar omdat exacte rastermetadata per HDF5-bestand gevalideerd moet worden.

Als Supabase Storage is geconfigureerd, probeert Rain Alert de nieuwste KNMI HDF5 nowcast eerst uit de bucket te lezen. Staat het bestand er nog niet, dan downloadt de server het via KNMI Data Platform en uploadt hij het naar `SUPABASE_STORAGE_BUCKET/SUPABASE_STORAGE_KNMI_PREFIX/{filename}`. Zo hoeven meerdere Railway instances hetzelfde rasterbestand niet opnieuw bij KNMI op te halen.

## Licentie en attributie

Rain Alert zelf gebruikt MIT. KNMI open data wordt geleverd onder CC BY 4.0. De app toont bronvermelding:

```text
Weerdata: KNMI Data Platform
```

Behoud die attributie in afgeleide versies.

## Installatie

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open daarna `http://localhost:3000`.

## Environment

Belangrijke variabelen:

- `KNMI_API_KEY`: server-side KNMI Data Platform API-key.
- `KNMI_DATASET_NAME`: standaard `radar_forecast`.
- `KNMI_DATASET_VERSION`: standaard `2.0`.
- `KNMI_HDF5_DATASET_PATH`: optioneel pad naar de numerieke HDF5 dataset.
- `SUPABASE_URL`: Supabase project URL.
- `SUPABASE_SERVICE_ROLE_KEY`: server-side service role key voor Storage. Nooit in frontend gebruiken.
- `SUPABASE_STORAGE_BUCKET`: bucket voor KNMI nowcast cache, bijvoorbeeld `rain-alert`.
- `SUPABASE_STORAGE_KNMI_PREFIX`: map/prefix in de bucket, standaard `knmi-nowcast`.
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY`: publieke VAPID key voor de browser.
- `VAPID_PRIVATE_KEY`: private VAPID key, uitsluitend server-side.
- `CRON_SECRET`: bearer token voor `/api/cron/rain-check`.
- `ENABLE_BUIENRADAR_DEMO`: alleen `true` in demo/development.
- `MAILERSEND_API_TOKEN`: server-side MailerSend token voor e-mailalerts.
- `MAILERSEND_FROM_EMAIL`: geverifieerde afzender in MailerSend.
- `MAILERSEND_FROM_NAME`: afzendernaam, standaard `Rain Alert`.

VAPID keys genereren kan bijvoorbeeld met:

```bash
npx web-push generate-vapid-keys
```

## Development

```bash
npm run dev
npm run test
npm run lint
```

Een handmatige regencheck:

```bash
curl -X POST http://localhost:3000/api/cron/rain-check \
  -H "Authorization: Bearer $CRON_SECRET"
```

## Productie deployment

### Supabase

1. Maak een Supabase project aan.
2. Gebruik de Supabase Postgres connection string als `DATABASE_URL`.
3. Maak een private Storage bucket, bijvoorbeeld `rain-alert`.
4. Zet server-side:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_STORAGE_BUCKET=rain-alert`
   - `SUPABASE_STORAGE_KNMI_PREFIX=knmi-nowcast`
5. Draai Prisma migraties tegen Supabase Postgres.

De service role key is alleen bedoeld voor de server. Zet hem nooit in `NEXT_PUBLIC_*` variabelen.

### Railway

Deze repo bevat `railway.json` en `nixpacks.toml`. Railway bouwt met `npm run build`, start met `npm run start`, en gebruikt `/api/health` als healthcheck.

1. Maak een Railway project aan vanuit de GitHub repository.
2. Zet alle production environment variables in Railway.
3. Zet `NEXT_PUBLIC_APP_URL` op de Railway domeinnaam, bijvoorbeeld `https://rain-alert-production.up.railway.app`.
4. Voeg een Railway cron service of scheduled job toe die elke 3 tot 5 minuten `POST /api/cron/rain-check` aanroept met `Authorization: Bearer $CRON_SECRET`.
5. Zet HTTPS aan via het Railway domein of je eigen domein; webpush en PWA-installatie vereisen een veilige origin.

Minimale Railway variables:

```text
DATABASE_URL=
KNMI_API_KEY=
NEXT_PUBLIC_VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_SUBJECT=
CRON_SECRET=
NEXT_PUBLIC_APP_URL=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_STORAGE_BUCKET=rain-alert
SUPABASE_STORAGE_KNMI_PREFIX=knmi-nowcast
MAILERSEND_API_TOKEN=
MAILERSEND_FROM_EMAIL=
```

## MVP scope

Deze code ondersteunt:

- één demo-gebruiker zonder login;
- maximaal 3 locaties;
- locatie toevoegen via kaart, GPS of adreszoek;
- alerttijd, intensiteitsdrempel, stille uren en cooldown;
- KNMI provider met Open-Meteo fallback;
- PWA manifest en service worker;
- webpush subscription en testmelding;
- MailerSend e-mailinstellingen en testmail;
- dashboard en detailpagina;
- eenvoudige logging in de MVP store;
- publiceerbare open-source projectbestanden.

## Architectuur

```text
/app                  Next.js routes en API routes
/components           UI componenten
/lib/weather          WeatherProvider interface en providers
/lib/scheduler        notificatiebeslissing en worker
/lib/notifications    webpush en service worker helpers
/lib/storage          Supabase Storage integratie voor KNMI cache
/lib/db               schema-validatie en MVP opslag
/prisma               PostgreSQL schema
/tests                unit tests en acceptatiescenario's
```

## Testscenario's

Zie `tests/acceptance-scenarios.md`. Unit tests dekken onder meer fallback, regen binnen/buiten waarschuwingstijd, intensiteitsdrempel, cooldown en stille uren.
