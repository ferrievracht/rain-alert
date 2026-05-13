import "server-only";

import type { RainForecast, WeatherProvider } from "./WeatherProvider";
import { WeatherProviderError } from "./WeatherProvider";
import { classifyRainIntensity } from "./intensity";
import { isValidLatLon } from "./geo";

export class OptionalBuienradarProvider implements WeatherProvider {
  name = "Buienradar demo";

  async getRainForecast(latitude: number, longitude: number): Promise<RainForecast[]> {
    if (process.env.ENABLE_BUIENRADAR_DEMO !== "true") {
      throw new WeatherProviderError(
        "Buienradar demo-provider is uitgeschakeld.",
        this.name,
        "provider_disabled"
      );
    }
    if (!isValidLatLon(latitude, longitude)) {
      throw new WeatherProviderError("Ongeldige coordinaten.", this.name, "invalid_coordinates");
    }

    const url = new URL("https://gpsgadget.buienradar.nl/data/raintext");
    url.searchParams.set("lat", latitude.toFixed(3));
    url.searchParams.set("lon", longitude.toFixed(3));

    const response = await fetch(url, { next: { revalidate: 300 } });
    if (!response.ok) {
      throw new WeatherProviderError(
        `Buienradar demo faalde (${response.status}).`,
        this.name,
        "buienradar_failed"
      );
    }

    const text = await response.text();
    const today = new Date();
    return text
      .trim()
      .split("\n")
      .slice(0, 24)
      .map((line) => {
        const [code, hhmm] = line.split("|");
        const timestamp = new Date(today);
        timestamp.setHours(Number(hhmm.slice(0, 2)), Number(hhmm.slice(3, 5)), 0, 0);
        const precipitationMmPerHour = Math.pow(10, (Number(code) - 109) / 32);
        return {
          timestamp,
          precipitationMmPerHour,
          intensity: classifyRainIntensity(precipitationMmPerHour),
          source: "Buienradar demo",
          confidence: 0.45
        };
      });
  }
}
