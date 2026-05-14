# Contributing

Dank je wel voor je interesse in Rain Alert.

## Lokale setup

1. Fork en clone de repository.
2. Kopieer `.env.example` naar `.env.local`.
3. Vul minimaal `DATABASE_URL`, `KNMI_API_KEY` en VAPID keys in voor volledige productiefunctionaliteit.
4. Installeer dependencies met `npm install`.
5. Start de app met `npm run dev`.

## Ontwikkelregels

- Zet geen API keys of VAPID private keys in frontendcode of commits.
- Zet MailerSend tokens alleen server-side in environment variables.
- Zet Supabase service role keys alleen server-side in environment variables.
- Houd KNMI als primaire beslisbron voor productie-notificaties.
- Gebruik Open-Meteo alleen als fallback of langere termijn bron.
- Buienradar mag alleen in demo- of developmentmodus worden gebruikt.
- Voeg tests toe voor wijzigingen in notificatielogica.
- Log geen onnodige persoonsgegevens.

## Pull requests

Beschrijf:

- wat er is veranderd;
- hoe je het getest hebt;
- of databronnen, licenties of privacygedrag geraakt worden.
