import { AppNav } from "@/components/AppNav";
import { EmailNotificationBox } from "@/components/EmailNotificationBox";
import { NotificationPermissionBox } from "@/components/NotificationPermissionBox";

export default function SettingsPage() {
  return (
    <>
      <AppNav />
      <main className="mx-auto max-w-3xl px-5 pb-28 pt-6 md:pb-10">
        <header className="mb-6">
          <p className="text-sm font-bold uppercase tracking-[0.14em] text-rain">Instellingen</p>
          <h1 className="mt-1 text-3xl font-black text-ink">Notificaties en bronnen</h1>
        </header>
        <div className="grid gap-4">
          <NotificationPermissionBox />
          <EmailNotificationBox />
          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
            <h2 className="text-lg font-black text-ink">Databronnen</h2>
            <p className="mt-2 text-sm leading-6 text-slateblue">
              Productiebeslissingen gebruiken KNMI Data Platform als primaire bron. Open-Meteo wordt gebruikt als fallback of voor langere termijn. Buienradar is alleen bedoeld als demo-provider wanneer dit expliciet is ingeschakeld.
            </p>
            <a className="mt-4 inline-block font-bold text-rain" href="https://dataplatform.knmi.nl/dataset/radar-forecast-2-0">
              KNMI dataset bekijken
            </a>
          </section>
          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
            <h2 className="text-lg font-black text-ink">iOS PWA push</h2>
            <p className="mt-2 text-sm leading-6 text-slateblue">
              Op iPhone en iPad zijn webpushmeldingen beschikbaar voor geïnstalleerde webapps. Voeg Rain Alert toe aan je beginscherm en open de app daarna vanaf dat icoon.
            </p>
          </section>
        </div>
      </main>
    </>
  );
}
