import "server-only";

import type { RainForecast, WeatherProvider } from "./WeatherProvider";
import { WeatherProviderError } from "./WeatherProvider";
import { classifyRainIntensity } from "./intensity";
import { isValidLatLon } from "./geo";

type OpenMeteoResponse = {
  minutely_15?: {
    time: string[];
    precipitation?: number[];
  };
  hourly?: {
    time: string[];
    precipitation?: number[];
  };
};

export class OpenMeteoProvider implements WeatherProvider {
  name = "Open-Meteo";

  async getRainForecast(latitude: number, longitude: number): Promise<RainForecast[]> {
    if (!isValidLatLon(latitude, longitude)) {
      throw new WeatherProviderError("Ongeldige coordinaten.", this.name, "invalid_coordinates");
    }

    const baseUrl = process.env.OPEN_METEO_BASE_URL || "https://api.open-meteo.com/v1/forecast";
    const url = new URL(baseUrl);
    url.searchParams.set("latitude", String(latitude));
    url.searchParams.set("longitude", String(longitude));
    url.searchParams.set("minutely_15", "precipitation");
    url.searchParams.set("hourly", "precipitation");
    url.searchParams.set("forecast_days", "1");
    url.searchParams.set("timezone", "auto");

    const response = await fetch(url, { next: { revalidate: 300 } });
    if (!response.ok) {
      throw new WeatherProviderError(
        `Open-Meteo forecast faalde (${response.status}).`,
        this.name,
        "open_meteo_failed"
      );
    }

    const payload = (await response.json()) as OpenMeteoResponse;
    const times = payload.minutely_15?.time || payload.hourly?.time || [];
    const precipitation = payload.minutely_15?.precipitation || payload.hourly?.precipitation || [];

    return times.slice(0, 16).map((time, index) => {
      const mmPerHour = Math.max(0, Number(precipitation[index]) || 0);
      return {
        timestamp: new Date(time),
        precipitationMmPerHour: mmPerHour,
        intensity: classifyRainIntensity(mmPerHour),
        source: "Open-Meteo",
        confidence: 0.65
      };
    });
  }
}
