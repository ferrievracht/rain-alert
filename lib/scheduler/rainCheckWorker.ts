import "server-only";

import { memoryStore } from "@/lib/db/memoryStore";
import { listLocations } from "@/lib/db/queries";
import { sendRainAlertEmail } from "@/lib/notifications/email";
import { sendPushToUser } from "@/lib/notifications/push";
import { KNMINowcastProvider, OpenMeteoProvider, WeatherProviderError, type RainForecast } from "@/lib/weather";
import { evaluateRainDecision, findFirstRainAboveThreshold } from "./rainDecision";

export async function runRainCheckCycle(now = new Date()) {
  const locations = await listLocations();
  const knmi = new KNMINowcastProvider();
  const openMeteo = new OpenMeteoProvider();
  const results = [];

  for (const location of locations.filter((item) => item.isActive)) {
    let provider = "KNMI";
    let forecast: RainForecast[] = [];
    let errorMessage: string | null = null;

    try {
      forecast = await knmi.getRainForecast(location.latitude, location.longitude);
    } catch (error) {
      errorMessage = error instanceof Error ? error.message : "KNMI provider faalde.";
      provider = "Open-Meteo";
      try {
        forecast = await openMeteo.getRainForecast(location.latitude, location.longitude);
      } catch (fallbackError) {
        errorMessage =
          fallbackError instanceof WeatherProviderError || fallbackError instanceof Error
            ? fallbackError.message
            : "Alle weerproviders zijn tijdelijk niet beschikbaar.";
      }
    }

    const firstRain = forecast.length
      ? findFirstRainAboveThreshold(
          forecast,
          location.alertSetting.minimumRainIntensityThreshold
        )
      : undefined;
    const hasPush = memoryStore.pushSubscriptions.some(
      (subscription) => subscription.userId === location.userId
    );
    const user = memoryStore.users.find((item) => item.id === location.userId);
    const hasEmail = Boolean(user?.email && user.emailNotificationsEnabled);
    const decision = evaluateRainDecision({
      now,
      location,
      setting: location.alertSetting,
      forecast,
      notificationLogs: memoryStore.notificationLogs,
      pushPermissionGranted: hasPush || hasEmail
    });

    if (decision.shouldNotify && decision.firstRain && decision.title && decision.body) {
      if (hasPush) {
        await sendPushToUser(location.userId, {
          title: decision.title,
          body: decision.body,
          url: `/locations/${location.id}`,
          locationId: location.id
        });
      }
      if (hasEmail && user?.email) {
        await sendRainAlertEmail({
          to: user.email,
          title: decision.title,
          body: decision.body,
          locationUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://127.0.0.1:3000"}/locations/${location.id}`
        });
      }
      memoryStore.notificationLogs.push({
        id: memoryStore.id(),
        userId: location.userId,
        locationId: location.id,
        sentAt: now,
        title: decision.title,
        body: decision.body,
        forecastTime: decision.firstRain.timestamp,
        intensity: decision.firstRain.intensity,
        provider
      });
    }

    memoryStore.rainCheckLogs.push({
      id: memoryStore.id(),
      locationId: location.id,
      checkedAt: now,
      provider,
      rainDetected: Boolean(firstRain),
      firstRainExpectedAt: firstRain?.timestamp,
      minutesUntilRain: decision.minutesUntilRain,
      intensity: firstRain?.intensity,
      precipitationMmPerHour: firstRain?.precipitationMmPerHour,
      notificationSent: decision.shouldNotify,
      errorMessage
    });

    results.push({ locationId: location.id, provider, decision, errorMessage });
  }

  return results;
}
