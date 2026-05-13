"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, RefreshCw } from "lucide-react";
import { AppNav } from "@/components/AppNav";
import { NotificationPermissionBox } from "@/components/NotificationPermissionBox";
import { RainStatusCard } from "@/components/RainStatusCard";

type Location = {
  id: string;
  name: string;
  addressLabel?: string | null;
  isActive: boolean;
  alertSetting: { warningMinutesBeforeRain: number };
  lastCheck?: {
    checkedAt: string | Date;
    provider: string;
    rainDetected: boolean;
    minutesUntilRain?: number | null;
    intensity?: string | null;
    errorMessage?: string | null;
  } | null;
};

export function DashboardClient() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function load() {
    setLoading(true);
    const response = await fetch("/api/locations");
    const payload = await response.json();
    setLocations(payload.locations || []);
    setLoading(false);
  }

  async function deleteLocation(id: string) {
    await fetch(`/api/locations/${id}`, { method: "DELETE" });
    await load();
  }

  async function runCheck() {
    setMessage("Regencheck draait...");
    const response = await fetch("/api/cron/rain-check", { method: "POST" });
    const payload = await response.json();
    setMessage(response.ok ? `${payload.checked} locaties gecheckt.` : payload.error);
    await load();
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <>
      <AppNav />
      <main className="mx-auto max-w-5xl px-5 pb-28 pt-6 md:pb-10">
        <header className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-rain">Rain Alert</p>
            <h1 className="mt-1 text-3xl font-black text-ink">Dashboard</h1>
          </div>
          <div className="flex gap-2">
            <button className="rounded-md border border-slate-200 bg-white p-3 text-ink" aria-label="Ververs regencheck" onClick={runCheck}>
              <RefreshCw size={18} />
            </button>
            <Link className="rounded-md bg-rain p-3 text-white" aria-label="Locatie toevoegen" href="/locations/new">
              <Plus size={18} />
            </Link>
          </div>
        </header>

        <div className="grid gap-4">
          <NotificationPermissionBox />
          {message ? <p className="rounded-md bg-white px-4 py-3 text-sm text-slateblue">{message}</p> : null}
          {loading ? <p className="text-slateblue">Locaties laden...</p> : null}
          {!loading && locations.length === 0 ? (
            <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
              <h2 className="text-xl font-black text-ink">Nog geen locaties</h2>
              <p className="mt-2 text-slateblue">Pinpoint een plek op de kaart en stel je eerste waarschuwing in.</p>
              <Link className="mt-5 inline-flex rounded-md bg-rain px-4 py-3 font-bold text-white" href="/locations/new">
                Locatie toevoegen
              </Link>
            </section>
          ) : null}
          <div className="grid gap-4 md:grid-cols-2">
            {locations.map((location) => (
              <RainStatusCard key={location.id} location={location} onDelete={deleteLocation} />
            ))}
          </div>
        </div>

        <footer className="mt-8 text-sm text-slateblue">
          Weerdata: <a className="font-bold text-rain" href="https://dataplatform.knmi.nl/dataset/radar-forecast-2-0">KNMI Data Platform</a>. Fallback: Open-Meteo.
        </footer>
      </main>
    </>
  );
}
