import "server-only";

import type { RainIntensity } from "@/lib/weather";
import { emailSettingsInputSchema, locationInputSchema } from "./schema";
import { memoryStore, type StoredAlertSetting, type StoredLocation } from "./memoryStore";

export type LocationWithSettings = StoredLocation & {
  alertSetting: StoredAlertSetting;
  lastCheck?: {
    checkedAt: Date;
    provider: string;
    rainDetected: boolean;
    firstRainExpectedAt?: Date | null;
    minutesUntilRain?: number | null;
    intensity?: RainIntensity | null;
    precipitationMmPerHour?: number | null;
    notificationSent: boolean;
    errorMessage?: string | null;
  } | null;
};

export async function getOrCreateDemoUser(userAgent?: string | null) {
  const user = memoryStore.users[0];
  if (userAgent) user.createdFromDevice ||= userAgent;
  return user;
}

export async function getEmailSettings(userId = "demo-user") {
  const user = memoryStore.users.find((item) => item.id === userId) || memoryStore.users[0];
  return {
    email: user.email || "",
    emailNotificationsEnabled: user.emailNotificationsEnabled
  };
}

export async function updateEmailSettings(input: unknown, userId = "demo-user") {
  const parsed = emailSettingsInputSchema.parse(input);
  const user = memoryStore.users.find((item) => item.id === userId) || memoryStore.users[0];
  user.email = parsed.email || null;
  user.emailNotificationsEnabled = Boolean(parsed.email && parsed.emailNotificationsEnabled);
  return getEmailSettings(userId);
}

export async function listLocations(userId = "demo-user"): Promise<LocationWithSettings[]> {
  return memoryStore.locations
    .filter((location) => location.userId === userId)
    .map((location) => ({
      ...location,
      alertSetting:
        memoryStore.alertSettings.find((setting) => setting.locationId === location.id) ||
        defaultAlertSetting(userId, location.id),
      lastCheck:
        memoryStore.rainCheckLogs
          .filter((log) => log.locationId === location.id)
          .sort((a, b) => b.checkedAt.getTime() - a.checkedAt.getTime())[0] || null
    }));
}

export async function getLocation(locationId: string) {
  return (await listLocations()).find((location) => location.id === locationId) || null;
}

export async function createLocation(input: unknown, userId = "demo-user") {
  if (memoryStore.locations.filter((location) => location.userId === userId).length >= 3) {
    throw new Error("MVP limiet: maximaal 3 locaties.");
  }

  const parsed = locationInputSchema.parse(input);
  const now = new Date();
  const location: StoredLocation = {
    id: memoryStore.id(),
    userId,
    name: parsed.name,
    latitude: parsed.latitude,
    longitude: parsed.longitude,
    addressLabel: parsed.addressLabel,
    isActive: parsed.isActive,
    createdAt: now,
    updatedAt: now
  };
  const alertSetting: StoredAlertSetting = {
    id: memoryStore.id(),
    userId,
    locationId: location.id,
    warningMinutesBeforeRain: parsed.warningMinutesBeforeRain,
    minimumRainIntensityThreshold: parsed.minimumRainIntensityThreshold,
    quietHoursStart: parsed.quietHoursStart,
    quietHoursEnd: parsed.quietHoursEnd,
    repeatNotificationCooldownMinutes: parsed.repeatNotificationCooldownMinutes,
    isActive: true
  };
  memoryStore.locations.push(location);
  memoryStore.alertSettings.push(alertSetting);
  return { ...location, alertSetting };
}

export async function updateLocation(locationId: string, input: unknown) {
  const parsed = locationInputSchema.partial().parse(input);
  const location = memoryStore.locations.find((item) => item.id === locationId);
  if (!location) return null;

  Object.assign(location, {
    name: parsed.name ?? location.name,
    latitude: parsed.latitude ?? location.latitude,
    longitude: parsed.longitude ?? location.longitude,
    addressLabel: parsed.addressLabel ?? location.addressLabel,
    isActive: parsed.isActive ?? location.isActive,
    updatedAt: new Date()
  });

  const setting = memoryStore.alertSettings.find((item) => item.locationId === locationId);
  if (setting) {
    Object.assign(setting, {
      warningMinutesBeforeRain:
        parsed.warningMinutesBeforeRain ?? setting.warningMinutesBeforeRain,
      minimumRainIntensityThreshold:
        parsed.minimumRainIntensityThreshold ?? setting.minimumRainIntensityThreshold,
      quietHoursStart: parsed.quietHoursStart ?? setting.quietHoursStart,
      quietHoursEnd: parsed.quietHoursEnd ?? setting.quietHoursEnd,
      repeatNotificationCooldownMinutes:
        parsed.repeatNotificationCooldownMinutes ?? setting.repeatNotificationCooldownMinutes,
      isActive: parsed.isActive ?? setting.isActive
    });
  }

  return getLocation(locationId);
}

export async function deleteLocation(locationId: string) {
  memoryStore.locations = memoryStore.locations.filter((location) => location.id !== locationId);
  memoryStore.alertSettings = memoryStore.alertSettings.filter((setting) => setting.locationId !== locationId);
  memoryStore.rainCheckLogs = memoryStore.rainCheckLogs.filter((log) => log.locationId !== locationId);
  memoryStore.notificationLogs = memoryStore.notificationLogs.filter((log) => log.locationId !== locationId);
}

export async function deleteAllUserData(userId = "demo-user") {
  memoryStore.locations = memoryStore.locations.filter((location) => location.userId !== userId);
  memoryStore.alertSettings = memoryStore.alertSettings.filter((setting) => setting.userId !== userId);
  memoryStore.pushSubscriptions = memoryStore.pushSubscriptions.filter((subscription) => subscription.userId !== userId);
  memoryStore.notificationLogs = memoryStore.notificationLogs.filter((log) => log.userId !== userId);
  memoryStore.rainCheckLogs = [];
  const user = memoryStore.users.find((item) => item.id === userId);
  if (user) {
    user.email = null;
    user.emailNotificationsEnabled = false;
  }
}

export async function savePushSubscription(input: {
  endpoint: string;
  keys: { p256dh: string; auth: string };
  userAgent?: string | null;
}, userId = "demo-user") {
  const existing = memoryStore.pushSubscriptions.find((item) => item.endpoint === input.endpoint);
  if (existing) {
    existing.p256dh = input.keys.p256dh;
    existing.auth = input.keys.auth;
    existing.lastUsedAt = new Date();
    return existing;
  }

  const subscription = {
    id: memoryStore.id(),
    userId,
    endpoint: input.endpoint,
    p256dh: input.keys.p256dh,
    auth: input.keys.auth,
    userAgent: input.userAgent,
    createdAt: new Date(),
    lastUsedAt: null
  };
  memoryStore.pushSubscriptions.push(subscription);
  return subscription;
}

function defaultAlertSetting(userId: string, locationId: string): StoredAlertSetting {
  return {
    id: memoryStore.id(),
    userId,
    locationId,
    warningMinutesBeforeRain: 15,
    minimumRainIntensityThreshold: "light",
    quietHoursStart: "23:00",
    quietHoursEnd: "07:00",
    repeatNotificationCooldownMinutes: 60,
    isActive: true
  };
}
