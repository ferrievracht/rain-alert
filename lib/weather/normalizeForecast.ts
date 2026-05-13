import type { RainForecast } from "./WeatherProvider";
import { classifyRainIntensity } from "./intensity";

export function normalizeForecast(forecast: RainForecast[]): RainForecast[] {
  const deduped = new Map<number, RainForecast>();

  for (const slot of forecast) {
    const timestamp = new Date(slot.timestamp);
    if (Number.isNaN(timestamp.valueOf())) continue;

    const precipitationMmPerHour = Math.max(0, Number(slot.precipitationMmPerHour) || 0);
    deduped.set(timestamp.getTime(), {
      ...slot,
      timestamp,
      precipitationMmPerHour,
      intensity: classifyRainIntensity(precipitationMmPerHour)
    });
  }

  return [...deduped.values()].sort(
    (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
  );
}
