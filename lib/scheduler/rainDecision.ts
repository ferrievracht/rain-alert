import { differenceInMinutes, isWithinInterval, subMinutes } from "date-fns";
import type { RainForecast, RainIntensity } from "@/lib/weather/WeatherProvider";
import { intensityLabel, meetsIntensityThreshold } from "@/lib/weather/intensity";
import { normalizeForecast } from "@/lib/weather/normalizeForecast";
import type { StoredAlertSetting, StoredLocation, StoredNotificationLog } from "@/lib/db/memoryStore";

export type RainDecision = {
  shouldNotify: boolean;
  reason: string;
  firstRain?: RainForecast;
  minutesUntilRain?: number;
  title?: string;
  body?: string;
};

export function findFirstRainAboveThreshold(
  forecast: RainForecast[],
  threshold: RainIntensity
) {
  return normalizeForecast(forecast).find((slot) =>
    meetsIntensityThreshold(slot.intensity, threshold)
  );
}

export function inQuietHours(now: Date, start?: string | null, end?: string | null) {
  if (!start || !end) return false;
  const [startHour, startMinute] = start.split(":").map(Number);
  const [endHour, endMinute] = end.split(":").map(Number);
  const startDate = new Date(now);
  startDate.setHours(startHour, startMinute, 0, 0);
  const endDate = new Date(now);
  endDate.setHours(endHour, endMinute, 0, 0);

  if (startDate <= endDate) {
    return isWithinInterval(now, { start: startDate, end: endDate });
  }

  return now >= startDate || now <= endDate;
}

export function notificationSentRecently(
  logs: StoredNotificationLog[],
  locationId: string,
  cooldownMinutes: number,
  now: Date
) {
  const boundary = subMinutes(now, cooldownMinutes);
  return logs.some(
    (log) => log.locationId === locationId && log.sentAt >= boundary && log.sentAt <= now
  );
}

export function buildNotificationTitle(location: StoredLocation, firstRain: RainForecast) {
  if (firstRain.intensity === "heavy") return `Stevige regen verwacht bij ${location.name}`;
  return `Regen verwacht bij ${location.name}`;
}

export function buildNotificationBody(minutesUntilRain: number, firstRain: RainForecast) {
  const label = intensityLabel(firstRain.intensity);
  if (firstRain.intensity === "heavy") {
    return `Over ongeveer ${minutesUntilRain} minuten wordt stevige regen verwacht.`;
  }
  return `Over ongeveer ${minutesUntilRain} minuten wordt ${label} verwacht. Neem eventueel een jas of paraplu mee.`;
}

export function evaluateRainDecision(input: {
  now: Date;
  location: StoredLocation;
  setting: StoredAlertSetting;
  forecast: RainForecast[];
  notificationLogs: StoredNotificationLog[];
  pushPermissionGranted: boolean;
}) {
  const { now, location, setting, forecast, notificationLogs, pushPermissionGranted } = input;

  if (!location.isActive) return { shouldNotify: false, reason: "location_inactive" };
  if (!setting.isActive) return { shouldNotify: false, reason: "setting_inactive" };
  if (!pushPermissionGranted) return { shouldNotify: false, reason: "push_not_granted" };
  if (inQuietHours(now, setting.quietHoursStart, setting.quietHoursEnd)) {
    return { shouldNotify: false, reason: "quiet_hours" };
  }

  const firstRain = findFirstRainAboveThreshold(
    forecast,
    setting.minimumRainIntensityThreshold
  );
  if (!firstRain) return { shouldNotify: false, reason: "no_rain_above_threshold" };

  const minutesUntilRain = Math.max(0, differenceInMinutes(firstRain.timestamp, now));
  if (minutesUntilRain > setting.warningMinutesBeforeRain) {
    return { shouldNotify: false, reason: "outside_warning_window", firstRain, minutesUntilRain };
  }

  if (
    notificationSentRecently(
      notificationLogs,
      location.id,
      setting.repeatNotificationCooldownMinutes,
      now
    )
  ) {
    return { shouldNotify: false, reason: "cooldown", firstRain, minutesUntilRain };
  }

  return {
    shouldNotify: true,
    reason: "notify",
    firstRain,
    minutesUntilRain,
    title: buildNotificationTitle(location, firstRain),
    body: buildNotificationBody(minutesUntilRain, firstRain)
  };
}
