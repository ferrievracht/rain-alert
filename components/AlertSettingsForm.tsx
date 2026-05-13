"use client";

import type { RainIntensity } from "@/lib/weather";

type Props = {
  value: {
    warningMinutesBeforeRain: number;
    minimumRainIntensityThreshold: RainIntensity;
    quietHoursStart?: string | null;
    quietHoursEnd?: string | null;
    repeatNotificationCooldownMinutes: number;
    isActive: boolean;
  };
  onChange: (value: Props["value"]) => void;
};

const warningOptions = [5, 10, 15, 30, 45, 60];
const intensityOptions: Array<[RainIntensity, string]> = [
  ["light", "Elke regen"],
  ["light", "Lichte regen"],
  ["moderate", "Matige regen"],
  ["heavy", "Zware regen"]
];

export function AlertSettingsForm({ value, onChange }: Props) {
  const update = (patch: Partial<Props["value"]>) => onChange({ ...value, ...patch });

  return (
    <div className="grid gap-4">
      <label className="grid gap-2 text-sm font-semibold text-ink">
        Waarschuwing vóór regen
        <select
          className="rounded-md border border-slate-300 bg-white px-3 py-2"
          value={value.warningMinutesBeforeRain}
          onChange={(event) => update({ warningMinutesBeforeRain: Number(event.target.value) })}
        >
          {warningOptions.map((option) => (
            <option key={option} value={option}>{option} minuten</option>
          ))}
        </select>
      </label>
      <label className="grid gap-2 text-sm font-semibold text-ink">
        Minimale neerslagintensiteit
        <select
          className="rounded-md border border-slate-300 bg-white px-3 py-2"
          value={value.minimumRainIntensityThreshold}
          onChange={(event) => update({ minimumRainIntensityThreshold: event.target.value as RainIntensity })}
        >
          {intensityOptions.map(([key, label], index) => (
            <option key={`${key}-${index}`} value={key}>{label}</option>
          ))}
        </select>
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="grid gap-2 text-sm font-semibold text-ink">
          Stil vanaf
          <input className="rounded-md border border-slate-300 px-3 py-2" type="time" value={value.quietHoursStart || ""} onChange={(event) => update({ quietHoursStart: event.target.value || null })} />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-ink">
          Stil tot
          <input className="rounded-md border border-slate-300 px-3 py-2" type="time" value={value.quietHoursEnd || ""} onChange={(event) => update({ quietHoursEnd: event.target.value || null })} />
        </label>
      </div>
      <label className="grid gap-2 text-sm font-semibold text-ink">
        Cooldown
        <input
          className="rounded-md border border-slate-300 px-3 py-2"
          min={5}
          max={1440}
          type="number"
          value={value.repeatNotificationCooldownMinutes}
          onChange={(event) => update({ repeatNotificationCooldownMinutes: Number(event.target.value) })}
        />
      </label>
      <label className="flex items-center gap-3 text-sm font-semibold text-ink">
        <input
          className="h-5 w-5"
          type="checkbox"
          checked={value.isActive ?? true}
          onChange={(event) => update({ isActive: event.target.checked })}
        />
        Locatie actief
      </label>
    </div>
  );
}
