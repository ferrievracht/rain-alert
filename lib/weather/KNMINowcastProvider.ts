import "server-only";

import type { RainForecast, WeatherProvider } from "./WeatherProvider";
import { WeatherProviderError } from "./WeatherProvider";
import { classifyRainIntensity } from "./intensity";
import { isInsideBounds, isValidLatLon, parseBounds } from "./geo";
import { KNMIOpenDataClient } from "./knmiOpenDataClient";
import { decodeKnmiHdf5Point } from "./knmiHdf5";

type CacheEntry = {
  filename: string;
  downloadedAt: number;
  buffer: Buffer;
};

let cacheEntry: CacheEntry | null = null;

export class KNMINowcastProvider implements WeatherProvider {
  name = "KNMI";

  constructor(private readonly client = new KNMIOpenDataClient()) {}

  async getRainForecast(latitude: number, longitude: number): Promise<RainForecast[]> {
    if (!isValidLatLon(latitude, longitude)) {
      throw new WeatherProviderError("Ongeldige coordinaten.", this.name, "invalid_coordinates");
    }
    if (!isInsideBounds(latitude, longitude, parseBounds(process.env.KNMI_GRID_BOUNDS))) {
      throw new WeatherProviderError(
        "Deze locatie ligt mogelijk buiten de ondersteunde KNMI-radardekking.",
        this.name,
        "outside_coverage"
      );
    }

    const { filename, buffer } = await this.getCachedNowcastFile();
    const slots = await decodeKnmiHdf5Point(buffer, filename, latitude, longitude);

    return slots.map((slot) => ({
      timestamp: slot.timestamp,
      precipitationMmPerHour: slot.precipitationMmPerHour,
      intensity: classifyRainIntensity(slot.precipitationMmPerHour),
      source: "KNMI Data Platform",
      confidence: 0.9
    }));
  }

  private async getCachedNowcastFile() {
    const ttlMs = Number(process.env.KNMI_CACHE_TTL_SECONDS || 240) * 1000;
    if (cacheEntry && Date.now() - cacheEntry.downloadedAt < ttlMs) {
      return cacheEntry;
    }

    const filename = await this.client.getLatestFile();
    if (cacheEntry?.filename === filename) {
      cacheEntry = { ...cacheEntry, downloadedAt: Date.now() };
      return cacheEntry;
    }

    const buffer = await this.client.downloadFile(filename);
    cacheEntry = { filename, buffer, downloadedAt: Date.now() };
    return cacheEntry;
  }
}
