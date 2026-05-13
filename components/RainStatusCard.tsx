import Link from "next/link";
import { Cloud, CloudRain, Settings, Trash2 } from "lucide-react";

type Props = {
  location: {
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
  onDelete?: (id: string) => void;
};

function statusText(location: Props["location"]) {
  if (!location.isActive) return "Notificaties uitgeschakeld";
  if (!location.lastCheck) return "Geen data beschikbaar";
  if (location.lastCheck.errorMessage) return "Geen data beschikbaar";
  if (!location.lastCheck.rainDetected) return "Droog";
  if ((location.lastCheck.minutesUntilRain ?? 0) <= 0) return "Regen actief";
  return `Regen verwacht over ${location.lastCheck.minutesUntilRain} minuten`;
}

export function RainStatusCard({ location, onDelete }: Props) {
  const raining = location.lastCheck?.rainDetected;

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className={`rounded-md p-2 ${raining ? "bg-rain/10 text-rain" : "bg-slate-100 text-slateblue"}`}>
            {raining ? <CloudRain size={22} /> : <Cloud size={22} />}
          </div>
          <div>
            <h2 className="text-lg font-bold text-ink">{location.name}</h2>
            <p className="text-sm text-slateblue">{location.addressLabel || "Gekozen kaartlocatie"}</p>
          </div>
        </div>
        <button
          aria-label="Verwijderen"
          className="rounded-md p-2 text-slateblue hover:bg-red-50 hover:text-red-700"
          onClick={() => onDelete?.(location.id)}
        >
          <Trash2 size={18} />
        </button>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-slateblue">Status</p>
          <p className="font-bold text-ink">{statusText(location)}</p>
        </div>
        <div>
          <p className="text-slateblue">Waarschuwing</p>
          <p className="font-bold text-ink">{location.alertSetting.warningMinutesBeforeRain} min</p>
        </div>
        <div>
          <p className="text-slateblue">Provider</p>
          <p className="font-bold text-ink">{location.lastCheck?.provider || "Nog niet gecheckt"}</p>
        </div>
        <div>
          <p className="text-slateblue">Laatste check</p>
          <p className="font-bold text-ink">
            {location.lastCheck?.checkedAt
              ? new Date(location.lastCheck.checkedAt).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })
              : "-"}
          </p>
        </div>
      </div>
      {location.lastCheck?.errorMessage ? (
        <p className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-900">{location.lastCheck.errorMessage}</p>
      ) : null}
      <Link className="mt-4 inline-flex items-center gap-2 rounded-md bg-ink px-3 py-2 text-sm font-bold text-white" href={`/locations/${location.id}`}>
        <Settings size={16} /> Instellingen
      </Link>
    </article>
  );
}
