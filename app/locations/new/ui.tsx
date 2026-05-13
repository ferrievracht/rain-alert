"use client";

import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { LocateFixed, Search } from "lucide-react";
import { AppNav } from "@/components/AppNav";
import { AlertSettingsForm } from "@/components/AlertSettingsForm";
import type { RainIntensity } from "@/lib/weather";

const LocationMap = dynamic(() => import("@/components/LocationMap"), { ssr: false });

type AlertSettingsState = {
  warningMinutesBeforeRain: number;
  minimumRainIntensityThreshold: RainIntensity;
  quietHoursStart?: string | null;
  quietHoursEnd?: string | null;
  repeatNotificationCooldownMinutes: number;
  isActive: boolean;
};

export function NewLocationClient() {
  const router = useRouter();
  const params = useSearchParams();
  const [latitude, setLatitude] = useState(52.3676);
  const [longitude, setLongitude] = useState(4.9041);
  const [name, setName] = useState("Thuis");
  const [addressLabel, setAddressLabel] = useState("Amsterdam");
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [settings, setSettings] = useState<AlertSettingsState>({
    warningMinutesBeforeRain: 15,
    minimumRainIntensityThreshold: "light" as RainIntensity,
    quietHoursStart: "23:00",
    quietHoursEnd: "07:00",
    repeatNotificationCooldownMinutes: 60,
    isActive: true
  });

  useEffect(() => {
    if (params.get("mode") === "gps") useGps();
  }, []);

  function useGps() {
    if (!navigator.geolocation) {
      setMessage("Je browser ondersteunt GPS-locatie niet.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setAddressLabel("Huidige locatie");
        setMessage("GPS-locatie geselecteerd.");
      },
      () => setMessage("Locatiepermissie geweigerd of niet beschikbaar."),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  async function searchAddress() {
    if (!query.trim()) return;
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("q", query);
    url.searchParams.set("format", "json");
    url.searchParams.set("limit", "1");
    const response = await fetch(url);
    const [result] = await response.json();
    if (!result) {
      setMessage("Adres niet gevonden.");
      return;
    }
    setLatitude(Number(result.lat));
    setLongitude(Number(result.lon));
    setAddressLabel(result.display_name);
  }

  async function save() {
    setMessage("");
    const response = await fetch("/api/locations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, latitude, longitude, addressLabel, ...settings })
    });
    const payload = await response.json();
    if (!response.ok) {
      setMessage(payload.error || "Opslaan mislukt.");
      return;
    }
    router.push(`/locations/${payload.location.id}`);
  }

  return (
    <>
      <AppNav />
      <main className="mx-auto max-w-4xl px-5 pb-28 pt-6 md:pb-10">
        <header className="mb-6">
          <p className="text-sm font-bold uppercase tracking-[0.14em] text-rain">Locatie selecteren</p>
          <h1 className="mt-1 text-3xl font-black text-ink">Nieuwe regenalert</h1>
        </header>

        <div className="grid gap-5 md:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
            <div className="mb-3 flex gap-2">
              <button className="inline-flex items-center gap-2 rounded-md bg-rain px-3 py-2 text-sm font-bold text-white" onClick={useGps}>
                <LocateFixed size={16} /> GPS
              </button>
              <div className="flex min-w-0 flex-1">
                <input className="min-w-0 flex-1 rounded-l-md border border-slate-300 px-3 py-2 text-sm" placeholder="Adres zoeken" value={query} onChange={(event) => setQuery(event.target.value)} />
                <button className="rounded-r-md bg-ink px-3 py-2 text-white" aria-label="Zoeken" onClick={searchAddress}>
                  <Search size={16} />
                </button>
              </div>
            </div>
            <LocationMap latitude={latitude} longitude={longitude} onChange={(lat, lon) => {
              setLatitude(lat);
              setLongitude(lon);
              setAddressLabel("Handmatig gekozen kaartpunt");
            }} />
            <p className="mt-3 text-sm text-slateblue">{addressLabel}</p>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
            <label className="grid gap-2 text-sm font-semibold text-ink">
              Naam locatie
              <input className="rounded-md border border-slate-300 px-3 py-2" value={name} onChange={(event) => setName(event.target.value)} />
            </label>
            <div className="mt-3 flex flex-wrap gap-2">
              {["Thuis", "Werk", "Terras", "ICEBAR"].map((example) => (
                <button key={example} className="rounded-md border border-slate-200 px-3 py-1 text-sm font-semibold text-slateblue" onClick={() => setName(example)}>
                  {example}
                </button>
              ))}
            </div>
            <div className="mt-5">
              <AlertSettingsForm value={settings} onChange={setSettings} />
            </div>
            {message ? <p className="mt-4 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-900">{message}</p> : null}
            <button className="mt-5 w-full rounded-md bg-rain px-4 py-3 font-bold text-white" onClick={save}>
              Opslaan
            </button>
          </section>
        </div>
      </main>
    </>
  );
}
