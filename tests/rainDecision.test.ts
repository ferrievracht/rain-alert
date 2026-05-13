import { describe, expect, it } from "vitest";
import { evaluateRainDecision, inQuietHours } from "@/lib/scheduler/rainDecision";
import type { RainForecast } from "@/lib/weather/WeatherProvider";
import type { StoredAlertSetting, StoredLocation, StoredNotificationLog } from "@/lib/db/memoryStore";

const now = new Date("2026-05-13T10:00:00.000Z");

const location: StoredLocation = {
  id: "loc-1",
  userId: "user-1",
  name: "Thuis",
  latitude: 52.1,
  longitude: 5.1,
  isActive: true,
  createdAt: now,
  updatedAt: now
};

const setting: StoredAlertSetting = {
  id: "set-1",
  userId: "user-1",
  locationId: "loc-1",
  warningMinutesBeforeRain: 15,
  minimumRainIntensityThreshold: "light",
  repeatNotificationCooldownMinutes: 60,
  quietHoursStart: null,
  quietHoursEnd: null,
  isActive: true
};

function forecast(minutes: number, precipitationMmPerHour: number): RainForecast[] {
  return [
    {
      timestamp: new Date(now.getTime() + minutes * 60_000),
      precipitationMmPerHour,
      intensity:
        precipitationMmPerHour >= 4
          ? "heavy"
          : precipitationMmPerHour >= 1
            ? "moderate"
            : precipitationMmPerHour > 0
              ? "light"
              : "none",
      source: "test"
    }
  ];
}

describe("rain notification decision", () => {
  it("notifies when rain is inside the warning window", () => {
    const decision = evaluateRainDecision({
      now,
      location,
      setting,
      forecast: forecast(10, 0.5),
      notificationLogs: [],
      pushPermissionGranted: true
    });

    expect(decision.shouldNotify).toBe(true);
    expect(decision.title).toContain("Thuis");
  });

  it("does not notify when rain is outside the warning window", () => {
    const decision = evaluateRainDecision({
      now,
      location,
      setting,
      forecast: forecast(30, 0.5),
      notificationLogs: [],
      pushPermissionGranted: true
    });

    expect(decision.shouldNotify).toBe(false);
    expect(decision.reason).toBe("outside_warning_window");
  });

  it("does not notify below the configured intensity threshold", () => {
    const decision = evaluateRainDecision({
      now,
      location,
      setting: { ...setting, minimumRainIntensityThreshold: "moderate" },
      forecast: forecast(10, 0.5),
      notificationLogs: [],
      pushPermissionGranted: true
    });

    expect(decision.reason).toBe("no_rain_above_threshold");
  });

  it("cooldown prevents duplicate notifications", () => {
    const logs: StoredNotificationLog[] = [
      {
        id: "log-1",
        userId: "user-1",
        locationId: "loc-1",
        sentAt: new Date(now.getTime() - 10 * 60_000),
        title: "Regen verwacht",
        body: "Test",
        forecastTime: now,
        intensity: "light",
        provider: "KNMI"
      }
    ];

    const decision = evaluateRainDecision({
      now,
      location,
      setting,
      forecast: forecast(10, 0.5),
      notificationLogs: logs,
      pushPermissionGranted: true
    });

    expect(decision.reason).toBe("cooldown");
  });

  it("quiet hours block notifications across midnight", () => {
    expect(inQuietHours(new Date("2026-05-13T23:30:00.000Z"), "23:00", "07:00")).toBe(true);
    expect(inQuietHours(new Date("2026-05-13T12:30:00.000Z"), "23:00", "07:00")).toBe(false);
  });
});
