"use client";

import { useEffect, useState } from "react";
import { Mail, Send } from "lucide-react";

export function EmailNotificationBox() {
  const [email, setEmail] = useState("");
  const [enabled, setEnabled] = useState(false);
  const [configured, setConfigured] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    const response = await fetch("/api/email/settings");
    const payload = await response.json();
    setEmail(payload.settings?.email || "");
    setEnabled(Boolean(payload.settings?.emailNotificationsEnabled));
    setConfigured(Boolean(payload.mailerSendConfigured));
  }

  async function save() {
    setBusy(true);
    setMessage("");
    const response = await fetch("/api/email/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email || null, emailNotificationsEnabled: enabled })
    });
    const payload = await response.json();
    setBusy(false);
    if (!response.ok) {
      setMessage(payload.error || "E-mailinstellingen konden niet worden opgeslagen.");
      return;
    }
    setEmail(payload.settings.email || "");
    setEnabled(Boolean(payload.settings.emailNotificationsEnabled));
    setConfigured(Boolean(payload.mailerSendConfigured));
    setMessage("E-mailinstellingen opgeslagen.");
  }

  async function sendTest() {
    setBusy(true);
    setMessage("");
    const response = await fetch("/api/email/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });
    const payload = await response.json();
    setBusy(false);
    setMessage(response.ok ? "Testmail verstuurd via MailerSend." : payload.error);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
      <div className="flex items-start gap-3">
        <div className="rounded-md bg-rain/10 p-2 text-rain">
          <Mail size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-bold text-ink">E-mail via MailerSend</h2>
          <p className="mt-1 text-sm leading-6 text-slateblue">
            Ontvang regenalerts ook per e-mail. De MailerSend API-token blijft server-side.
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3">
        <label className="grid gap-2 text-sm font-semibold text-ink">
          E-mailadres
          <input
            className="rounded-md border border-slate-300 px-3 py-2"
            inputMode="email"
            placeholder="jij@example.com"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        <label className="flex items-center gap-3 text-sm font-semibold text-ink">
          <input
            className="h-5 w-5"
            type="checkbox"
            checked={enabled}
            onChange={(event) => setEnabled(event.target.checked)}
          />
          E-mailalerts inschakelen
        </label>
        {!configured ? (
          <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-900">
            MailerSend is nog niet geconfigureerd. Zet `MAILERSEND_API_TOKEN` en `MAILERSEND_FROM_EMAIL` in `.env.local`.
          </p>
        ) : null}
        {message ? <p className="rounded-md bg-mist px-3 py-2 text-sm text-slateblue">{message}</p> : null}
        <div className="grid grid-cols-2 gap-3">
          <button className="rounded-md bg-rain px-4 py-3 font-bold text-white disabled:opacity-50" disabled={busy} onClick={save}>
            Opslaan
          </button>
          <button
            className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-200 px-4 py-3 font-bold text-ink disabled:opacity-50"
            disabled={busy || !email}
            onClick={sendTest}
          >
            <Send size={16} /> Testmail
          </button>
        </div>
      </div>
    </section>
  );
}
