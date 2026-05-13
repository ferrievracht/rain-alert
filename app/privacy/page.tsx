"use client";

import { useState } from "react";
import { AppNav } from "@/components/AppNav";

export default function PrivacyPage() {
  const [message, setMessage] = useState("");

  async function deleteAll() {
    const response = await fetch("/api/privacy/delete-all", { method: "POST" });
    setMessage(response.ok ? "Alle lokale MVP-gegevens zijn verwijderd." : "Verwijderen mislukt.");
  }

  return (
    <>
      <AppNav />
      <main className="mx-auto max-w-3xl px-5 pb-28 pt-6 md:pb-10">
        <header className="mb-6">
          <p className="text-sm font-bold uppercase tracking-[0.14em] text-rain">Privacy</p>
          <h1 className="mt-1 text-3xl font-black text-ink">Locatie en data</h1>
        </header>
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
          <div className="grid gap-3 text-sm leading-6 text-slateblue">
            <p>Je locatie wordt alleen gebruikt voor regenmeldingen.</p>
            <p>Rain Alert slaat alleen gekozen locaties, alertinstellingen en noodzakelijke pushgegevens op.</p>
            <p>Er is geen verkoop van locatiegegevens en geen tracking buiten noodzakelijke appfunctionaliteit.</p>
            <p>Weerdata: KNMI Data Platform onder CC BY 4.0; fallbackdata: Open-Meteo.</p>
          </div>
          {message ? <p className="mt-4 rounded-md bg-mist px-3 py-2 text-sm text-slateblue">{message}</p> : null}
          <button className="mt-5 rounded-md bg-red-700 px-4 py-3 font-bold text-white" onClick={deleteAll}>
            Alle gegevens verwijderen
          </button>
        </section>
      </main>
    </>
  );
}
