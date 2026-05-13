"use client";

import { ReferenceLine, ResponsiveContainer, Area, AreaChart, XAxis, YAxis, Tooltip } from "recharts";
import type { RainForecast } from "@/lib/weather";

export function RainForecastChart({
  forecast,
  warningMinutes
}: {
  forecast: RainForecast[];
  warningMinutes: number;
}) {
  const now = new Date();
  const data = forecast.map((slot) => ({
    time: new Date(slot.timestamp).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" }),
    minutes: Math.round((new Date(slot.timestamp).getTime() - now.getTime()) / 60000),
    rain: Number(slot.precipitationMmPerHour.toFixed(2)),
    intensity: slot.intensity
  }));

  return (
    <div className="h-64 rounded-lg border border-slate-200 bg-white p-3">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <XAxis dataKey="time" tick={{ fontSize: 12 }} minTickGap={24} />
          <YAxis tick={{ fontSize: 12 }} unit=" mm/u" width={58} />
          <Tooltip />
          <ReferenceLine x={data.find((item) => item.minutes >= 0)?.time} stroke="#17212b" label="nu" />
          <ReferenceLine x={data.find((item) => item.minutes >= warningMinutes)?.time} stroke="#1b75bb" strokeDasharray="4 4" label="melding" />
          <ReferenceLine y={1} stroke="#70b8d8" strokeDasharray="3 3" />
          <ReferenceLine y={4} stroke="#0f4c81" strokeDasharray="3 3" />
          <Area type="monotone" dataKey="rain" stroke="#1b75bb" fill="#70b8d8" fillOpacity={0.38} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
