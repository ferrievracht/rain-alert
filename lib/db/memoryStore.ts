import type { RainIntensity } from "@/lib/weather/WeatherProvider";

export type StoredUser = {
  id: string;
  createdAt: Date;
  notificationPermissionStatus: string;
  email?: string | null;
  emailNotificationsEnabled: boolean;
  timezone: string;
  preferredLanguage: string;
  createdFromDevice?: string | null;
};

export type StoredLocation = {
  id: string;
  userId: string;
  name: string;
  latitude: number;
  longitude: number;
  addressLabel?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type StoredAlertSetting = {
  id: string;
  userId: string;
  locationId: string;
  warningMinutesBeforeRain: number;
  minimumRainIntensityThreshold: RainIntensity;
  quietHoursStart?: string | null;
  quietHoursEnd?: string | null;
  repeatNotificationCooldownMinutes: number;
  isActive: boolean;
};

export type StoredPushSubscription = {
  id: string;
  userId: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  userAgent?: string | null;
  createdAt: Date;
  lastUsedAt?: Date | null;
};

export type StoredRainCheckLog = {
  id: string;
  locationId: string;
  checkedAt: Date;
  provider: string;
  rainDetected: boolean;
  firstRainExpectedAt?: Date | null;
  minutesUntilRain?: number | null;
  intensity?: RainIntensity | null;
  precipitationMmPerHour?: number | null;
  notificationSent: boolean;
  errorMessage?: string | null;
};

export type StoredNotificationLog = {
  id: string;
  userId: string;
  locationId: string;
  sentAt: Date;
  title: string;
  body: string;
  forecastTime: Date;
  intensity: RainIntensity;
  provider: string;
  clickedAt?: Date | null;
};

const id = () => crypto.randomUUID();
const demoUser: StoredUser = {
  id: "demo-user",
  createdAt: new Date(),
  notificationPermissionStatus: "default",
  email: null,
  emailNotificationsEnabled: false,
  timezone: "Europe/Amsterdam",
  preferredLanguage: "nl",
  createdFromDevice: "local"
};

export const memoryStore = {
  users: [demoUser] as StoredUser[],
  locations: [] as StoredLocation[],
  alertSettings: [] as StoredAlertSetting[],
  pushSubscriptions: [] as StoredPushSubscription[],
  rainCheckLogs: [] as StoredRainCheckLog[],
  notificationLogs: [] as StoredNotificationLog[],
  id
};
