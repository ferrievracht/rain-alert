export type RainIntensity = "none" | "light" | "moderate" | "heavy";

export interface RainForecast {
  timestamp: Date;
  precipitationMmPerHour: number;
  intensity: RainIntensity;
  source: string;
  confidence?: number;
}

export interface WeatherProvider {
  name: string;
  getRainForecast(latitude: number, longitude: number): Promise<RainForecast[]>;
}

export class WeatherProviderError extends Error {
  constructor(
    message: string,
    public readonly provider: string,
    public readonly code: string,
    public readonly cause?: unknown
  ) {
    super(message);
  }
}
