import { NextRequest, NextResponse } from "next/server";
import { KNMINowcastProvider, OpenMeteoProvider, WeatherProviderError } from "@/lib/weather";

function fallbackNotice(error: unknown) {
  if (error instanceof WeatherProviderError && error.code === "missing_api_key") {
    return "Open-Meteo fallback actief. Voeg KNMI_API_KEY server-side toe voor productie-nowcasts.";
  }
  if (error instanceof WeatherProviderError && error.code === "outside_coverage") {
    return "Deze locatie ligt mogelijk buiten de ondersteunde KNMI-radardekking. Open-Meteo fallback actief.";
  }
  return "KNMI-nowcast is tijdelijk niet beschikbaar. Open-Meteo fallback actief.";
}

export async function GET(request: NextRequest) {
  const latitude = Number(request.nextUrl.searchParams.get("lat"));
  const longitude = Number(request.nextUrl.searchParams.get("lon"));
  const knmi = new KNMINowcastProvider();
  const openMeteo = new OpenMeteoProvider();

  try {
    const forecast = await knmi.getRainForecast(latitude, longitude);
    return NextResponse.json({ provider: "KNMI", forecast });
  } catch (error) {
    try {
      const forecast = await openMeteo.getRainForecast(latitude, longitude);
      return NextResponse.json({
        provider: "Open-Meteo",
        fallbackNotice: fallbackNotice(error),
        forecast
      });
    } catch (fallbackError) {
      return NextResponse.json(
        {
          error:
            fallbackError instanceof Error
              ? fallbackError.message
              : "Geen actuele regeninformatie beschikbaar voor deze locatie."
        },
        { status: 503 }
      );
    }
  }
}
