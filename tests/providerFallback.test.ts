import { describe, expect, it, vi } from "vitest";
import { WeatherProviderError, type WeatherProvider } from "@/lib/weather/WeatherProvider";

async function getForecastWithFallback(primary: WeatherProvider, fallback: WeatherProvider) {
  try {
    return { provider: primary.name, forecast: await primary.getRainForecast(52, 5) };
  } catch {
    return { provider: fallback.name, forecast: await fallback.getRainForecast(52, 5) };
  }
}

describe("provider fallback", () => {
  it("uses Open-Meteo when KNMI fails", async () => {
    const knmi: WeatherProvider = {
      name: "KNMI",
      getRainForecast: vi.fn().mockRejectedValue(new WeatherProviderError("fail", "KNMI", "test"))
    };
    const openMeteo: WeatherProvider = {
      name: "Open-Meteo",
      getRainForecast: vi.fn().mockResolvedValue([
        {
          timestamp: new Date(),
          precipitationMmPerHour: 0,
          intensity: "none",
          source: "Open-Meteo"
        }
      ])
    };

    const result = await getForecastWithFallback(knmi, openMeteo);
    expect(result.provider).toBe("Open-Meteo");
    expect(result.forecast).toHaveLength(1);
  });
});
