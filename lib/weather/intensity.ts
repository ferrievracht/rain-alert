import type { RainIntensity } from "./WeatherProvider";

export const intensityRank: Record<RainIntensity, number> = {
  none: 0,
  light: 1,
  moderate: 2,
  heavy: 3
};

export type IntensityThresholds = {
  lightMin: number;
  moderateMin: number;
  heavyMin: number;
};

export const defaultIntensityThresholds: IntensityThresholds = {
  lightMin: 0.0001,
  moderateMin: 1,
  heavyMin: 4
};

export function classifyRainIntensity(
  mmPerHour: number,
  thresholds = defaultIntensityThresholds
): RainIntensity {
  if (!Number.isFinite(mmPerHour) || mmPerHour <= 0) return "none";
  if (mmPerHour >= thresholds.heavyMin) return "heavy";
  if (mmPerHour >= thresholds.moderateMin) return "moderate";
  return "light";
}

export function meetsIntensityThreshold(
  actual: RainIntensity,
  threshold: RainIntensity
) {
  return intensityRank[actual] >= intensityRank[threshold] && actual !== "none";
}

export function intensityLabel(intensity: RainIntensity) {
  return {
    none: "geen regen",
    light: "lichte regen",
    moderate: "matige regen",
    heavy: "stevige regen"
  }[intensity];
}
