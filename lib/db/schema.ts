import { z } from "zod";

export const rainIntensitySchema = z.enum(["none", "light", "moderate", "heavy"]);

export const locationInputSchema = z.object({
  name: z.string().min(1).max(80),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  addressLabel: z.string().max(180).optional().nullable(),
  isActive: z.boolean().default(true),
  warningMinutesBeforeRain: z.union([z.literal(5), z.literal(10), z.literal(15), z.literal(30), z.literal(45), z.literal(60)]),
  minimumRainIntensityThreshold: rainIntensitySchema.default("light"),
  quietHoursStart: z.string().regex(/^\d{2}:\d{2}$/).optional().nullable(),
  quietHoursEnd: z.string().regex(/^\d{2}:\d{2}$/).optional().nullable(),
  repeatNotificationCooldownMinutes: z.number().int().min(5).max(1440).default(60)
});

export const pushSubscriptionInputSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string().min(10),
    auth: z.string().min(8)
  })
});

export const emailSettingsInputSchema = z.object({
  email: z.string().email().optional().nullable(),
  emailNotificationsEnabled: z.boolean().default(false)
});
