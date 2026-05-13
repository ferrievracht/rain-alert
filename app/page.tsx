import Link from "next/link";
import { Bell, LocateFixed, MapPinned, Search } from "lucide-react";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col px-5 pb-24 pt-8 md:pb-10">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-rain p-3 text-white">
            <Bell size={24} />
          </div>
          <span className="text-xl font-black text-ink">Rain Alert</span>
        </div>
        <Link className="rounded-md px-3 py-2 text-sm font-bold text-rain hover:bg-white" href="/dashboard">
          Dashboard
        </Link>
      </header>

      <section className="grid flex-1 content-center gap-8 py-10 md:grid-cols-[1.05fr_0.95fr] md:items-center">
        <div>
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.14em] text-rain">Open weerdata, geen gedoe</p>
          <h1 className="max-w-xl text-5xl font-black leading-tight text-ink md:text-6xl">
            Rain Alert
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-slateblue">
            Ontvang een melding voordat er regen aankomt op jouw gekozen locatie.
          </p>
          <p className="mt-4 max-w-xl rounded-lg border border-slate-200 bg-white p-4 text-sm text-slateblue">
            Je locatie wordt alleen gebruikt voor regenmeldingen. Weerdata: KNMI Data Platform, met Open-Meteo als fallback.
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
          <div className="grid gap-3">
            <Link className="flex items-center justify-between rounded-md bg-rain px-4 py-4 font-bold text-white" href="/locations/new?mode=gps">
              Gebruik huidige locatie <LocateFixed size={20} />
            </Link>
            <Link className="flex items-center justify-between rounded-md border border-slate-200 px-4 py-4 font-bold text-ink hover:bg-mist" href="/locations/new">
              Kies locatie op kaart <MapPinned size={20} />
            </Link>
            <Link className="flex items-center justify-between rounded-md border border-slate-200 px-4 py-4 font-bold text-ink hover:bg-mist" href="/locations/new?mode=search">
              Adres zoeken <Search size={20} />
            </Link>
          </div>
          <div className="mt-5 border-t border-slate-200 pt-4 text-sm leading-6 text-slateblue">
            Pushmeldingen werken op Android en desktop in ondersteunde browsers. Op iOS moet Rain Alert eerst als PWA op het beginscherm staan.
          </div>
        </div>
      </section>
    </main>
  );
}
