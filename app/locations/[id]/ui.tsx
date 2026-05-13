"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { BellRing, Save, Trash2 } from "lucide-react";
import { AppNav } from "@/components/AppNav";
import { AlertSettingsForm } from "@/components/AlertSettingsForm";
import { RainForecastChart } from "@/components/RainForecastChart";
import type { RainForecast, RainIntensity } from "@/lib/weather";

const LocationMap = dynamic(() => import("@/components/LocationMap"), { ssr: false });

type LocationDetail = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  addressLabel?: string | null;
  isActive: boolean;
  alertSetting: {
    warningMinutesBeforeRain: number;
    minimumRainIntensityThreshold: RainIntensity;
    quietHoursStart?: string | null;
    quietHoursEnd?: string | null;
    repeatNotificationCooldownMinutes: number;
    isActive: boolean;
  };
};

export function LocationDetailClient({ id }: { id: string }) {
  const [location, setLocation] = useState<LocationDetail | null>(null);
  const [forecast, setForecast] = useState<RainForecast[]>([]);
  const [provider, setProvider] = useState("");
  const [message, setMessage] = useState("");
  const [forecastNotice, setForecastNotice] = useState("");
  const [missing, setMissing] = useState(false);

  async function load() {
    const response = await fetch(`/api/locations/${id}`);
    const payload = await response.json();
    if (!response.ok || !payload.location) {
      setMissing(true);
      setMessage(payload.error || "Locatie niet gevonden.");
      return;
    }
    setMissing(false);
    setLocation(payload.location);
    if (payload.location) loadForecast(payload.location.latitude, payload.location.longitude);
  }

  async function loadForecast(lat: number, lon: number) {
    const response = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
    const payload = await response.json();
    if (response.ok) {
      setForecast(payload.forecast || []);
      setProvider(payload.provider);
      setForecastNotice(payload.fallbackNotice || "");
    } else {
      setForecastNotice("");
      setMessage(payload.error || "De weerprovider is tijdelijk niet beschikbaar.");
    }
  }

  async function save() {
    if (!location) return;
    const response = await fetch(`/api/locations/${location.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: location.name,
        latitude: location.latitude,
        longitude: location.longitude,
        addressLabel: location.addressLabel,
        ...location.alertSetting
      })
    });
    const payload = await response.json();
    setMessage(response.ok ? "Instellingen opgeslagen." : payload.error);
    await load();
  }

  async function testNotification() {
    const response = await fetch("/api/push/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locationId: id })
    });
    const payload = await response.json();
    setMessage(response.ok ? "Testmelding verstuurd." : payload.error);
  }

  async function remove() {
    await fetch(`/api/locations/${id}`, { method: "DELETE" });
    window.location.href = "/dashboard";
  }

  useEffect(() => {
    load();
  }, [id]);

  if (missing) {
    return (
      <>
        <AppNav />
        <main className="mx-auto grid min-h-screen max-w-xl content-center px-5 pb-28 md:pb-10">
          <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
            <h1 className="text-2xl font-black text-ink">Locatie niet gevonden</h1>
            <p className="mt-2 text-slateblue">
              {message || "Deze locatie staat niet meer in de lokale MVP-opslag. Maak een nieuwe locatie aan."}
            </p>
            <a className="mt-5 inline-flex rounded-md bg-rain px-4 py-3 font-bold text-white" href="/locations/new">
              Nieuwe locatie toevoegen
            </a>
          </section>
        </main>
      </>
    );
  }

  if (!location) {
    return (
      <>
        <AppNav />
        <main className="mx-auto max-w-4xl px-5 py-8 text-slateblue">Locatie laden...</main>
      </>
    );
  }

  const firstRain = forecast.find((slot) => slot.intensity !== "none");

  return (
    <>
      <AppNav />
      <main className="mx-auto max-w-5xl px-5 pb-28 pt-6 md:pb-10">
        <header className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-rain">Locatie</p>
            <input className="mt-1 w-full bg-transparent text-3xl font-black text-ink outline-none" value={location.name} onChange={(event) => setLocation({ ...location, name: event.target.value })} />
            <p className="mt-1 text-sm text-slateblue">{location.addressLabel || "Gekozen kaartlocatie"}</p>
          </div>
          <button className="rounded-md border border-red-200 bg-white p-3 text-red-700" aria-label="Verwijderen" onClick={remove}>
            <Trash2 size={18} />
          </button>
        </header>

        <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="grid gap-4">
            <LocationMap latitude={location.latitude} longitude={location.longitude} onChange={(lat, lon) => setLocation({ ...location, latitude: lat, longitude: lon, addressLabel: "Handmatig gekozen kaartpunt" })} height="380px" />
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-ink">Regenverwachting komende 120 minuten</h2>
                  <p className="text-sm text-slateblue">Databron: {provider || "nog niet geladen"}</p>
                </div>
                <button className="rounded-md border border-slate-200 px-3 py-2 text-sm font-bold text-ink" onClick={() => loadForecast(location.latitude, location.longitude)}>
                  Ververs
                </button>
              </div>
              {forecast.length ? (
                <RainForecastChart forecast={forecast} warningMinutes={location.alertSetting.warningMinutesBeforeRain} />
              ) : (
                <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-900">Geen actuele regeninformatie beschikbaar voor deze locatie.</p>
              )}
              {forecastNotice ? (
                <p className="mt-3 rounded-md bg-blue-50 px-3 py-2 text-sm text-blue-900">
                  {forecastNotice}
                </p>
              ) : null}
              {firstRain ? <p className="mt-3 text-sm text-slateblue">Eerste regen rond {new Date(firstRain.timestamp).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}.</p> : null}
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
            <h2 className="text-lg font-black text-ink">Alertinstellingen</h2>
            <div className="mt-4">
              <AlertSettingsForm
                value={location.alertSetting}
                onChange={(alertSetting) => setLocation({ ...location, alertSetting })}
              />
            </div>
            {message ? <p className="mt-4 rounded-md bg-mist px-3 py-2 text-sm text-slateblue">{message}</p> : null}
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button className="inline-flex items-center justify-center gap-2 rounded-md bg-rain px-4 py-3 font-bold text-white" onClick={save}>
                <Save size={16} /> Opslaan
              </button>
              <button className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-200 px-4 py-3 font-bold text-ink" onClick={testNotification}>
                <BellRing size={16} /> Test
              </button>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
