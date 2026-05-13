"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff, Info } from "lucide-react";
import { subscribeToPush } from "@/lib/notifications/serviceWorker";

export function NotificationPermissionBox() {
  const [status, setStatus] = useState("default");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setStatus(typeof Notification === "undefined" ? "unsupported" : Notification.permission);
  }, []);

  async function enable() {
    setBusy(true);
    setMessage("");
    const result = await subscribeToPush();
    if (result.ok) {
      setStatus("granted");
      setMessage("Pushmeldingen staan aan voor deze browser.");
    } else {
      setStatus(typeof Notification === "undefined" ? "unsupported" : Notification.permission);
      setMessage(result.message);
    }
    setBusy(false);
  }

  const supported =
    status !== "unsupported" &&
    typeof navigator !== "undefined" &&
    "serviceWorker" in navigator;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
      <div className="flex items-start gap-3">
        <div className="rounded-md bg-rain/10 p-2 text-rain">
          {status === "granted" ? <Bell size={20} /> : <BellOff size={20} />}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-bold text-ink">Pushmeldingen</h2>
          <p className="mt-1 text-sm text-slateblue">
            {supported
              ? "Sta meldingen toe om regenalerts te ontvangen. Op iOS werkt dit na installatie als PWA op het beginscherm."
              : "Deze browser ondersteunt pushmeldingen niet volledig."}
          </p>
          {message ? <p className="mt-2 text-sm text-slateblue">{message}</p> : null}
        </div>
        <button
          className="rounded-md bg-rain px-3 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!supported || busy || status === "granted" || status === "denied"}
          onClick={enable}
        >
          {status === "granted" ? "Aan" : status === "denied" ? "Geblokkeerd" : "Aanzetten"}
        </button>
      </div>
      {status === "denied" ? (
        <div className="mt-4 flex gap-3 rounded-md bg-amber-50 px-3 py-3 text-sm leading-6 text-amber-900">
          <Info className="mt-0.5 shrink-0" size={18} />
          <p>
            Pushmeldingen zijn geblokkeerd voor deze site. Gebruik het site-icoon in de adresbalk of je browserinstellingen om notificaties weer toe te staan.
          </p>
        </div>
      ) : null}
    </section>
  );
}
