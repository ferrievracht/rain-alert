# Rain Alert testscenario's

- Locatie toevoegen via kaart: open `/locations/new`, klik op de kaart, geef een naam en sla op.
- Locatie toevoegen via GPS: open `/locations/new?mode=gps`, sta GPS toe en sla op.
- Notificaties toestaan: open `/settings`, klik `Aanzetten`, controleer dat een subscription naar `/api/push/subscribe` gaat.
- Notificaties weigeren: blokkeer browsermeldingen en controleer de foutmelding in de notificatiebox.
- MailerSend e-mail instellen: open `/settings`, vul e-mailadres in, schakel e-mailalerts in en sla op.
- MailerSend testmail: zet `MAILERSEND_API_TOKEN` en `MAILERSEND_FROM_EMAIL`, verstuur een testmail vanuit `/settings`.
- Supabase Storage cache: zet `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` en `SUPABASE_STORAGE_BUCKET`, haal KNMI nowcast op en controleer dat het HDF5 bestand onder `knmi-nowcast/` wordt opgeslagen.
- Railway healthcheck: open `/api/health` en controleer `ok: true`.
- KNMI forecast succesvol ophalen: zet `KNMI_API_KEY`, installeer `h5wasm`, configureer `KNMI_HDF5_DATASET_PATH` indien nodig en open `/api/weather?lat=52.37&lon=4.90`.
- KNMI faalt en Open-Meteo fallback werkt: laat `KNMI_API_KEY` leeg en controleer dat `/api/weather` `provider: Open-Meteo` teruggeeft.
- Regen verwacht binnen ingestelde tijd: unit test `rainDecision.test.ts` scenario `notifies when rain is inside the warning window`.
- Regen verwacht buiten ingestelde tijd: unit test `outside_warning_window`.
- Regenintensiteit onder drempel: unit test `no_rain_above_threshold`.
- Cooldown voorkomt dubbele melding: unit test `cooldown`.
- Stille uren blokkeren melding: unit test `quiet hours block notifications`.
- Locatie buiten KNMI-dekking: roep `/api/weather` aan met coordinaten buiten `KNMI_GRID_BOUNDS` en controleer fallback/foutmelding.
- Locatie verwijderen: klik de verwijderknop op dashboard of detailpagina.
- Alle gegevens verwijderen: open `/privacy` en klik `Alle gegevens verwijderen`.
