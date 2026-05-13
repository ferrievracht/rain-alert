import "server-only";

import { WeatherProviderError } from "./WeatherProvider";

type ListFilesResponse = {
  files?: Array<{ filename: string; size?: number; created?: string }>;
  nextPageToken?: string;
};

const baseUrl = "https://api.dataplatform.knmi.nl/open-data/v1";

export class KNMIOpenDataClient {
  constructor(
    private readonly apiKey = process.env.KNMI_API_KEY,
    private readonly datasetName = process.env.KNMI_DATASET_NAME || "radar_forecast",
    private readonly datasetVersion = process.env.KNMI_DATASET_VERSION || "2.0"
  ) {}

  async getLatestFile() {
    if (!this.apiKey) {
      throw new WeatherProviderError(
        "KNMI API-key ontbreekt. Zet KNMI_API_KEY server-side in de environment.",
        "KNMI",
        "missing_api_key"
      );
    }

    const url = new URL(
      `${baseUrl}/datasets/${this.datasetName}/versions/${this.datasetVersion}/files`
    );
    url.searchParams.set("maxKeys", "1");
    url.searchParams.set("orderBy", "created");
    url.searchParams.set("sorting", "desc");

    const response = await fetch(url, {
      headers: { Authorization: this.apiKey },
      cache: "no-store"
    });

    if (!response.ok) {
      throw new WeatherProviderError(
        `KNMI bestandslijst kon niet worden opgehaald (${response.status}).`,
        "KNMI",
        "list_files_failed"
      );
    }

    const payload = (await response.json()) as ListFilesResponse;
    const latestFile = payload.files?.[0]?.filename;
    if (!latestFile) {
      throw new WeatherProviderError("KNMI gaf geen actuele nowcastfile terug.", "KNMI", "no_file");
    }

    return latestFile;
  }

  async downloadFile(filename: string) {
    if (!this.apiKey) {
      throw new WeatherProviderError("KNMI API-key ontbreekt.", "KNMI", "missing_api_key");
    }

    const url = `${baseUrl}/datasets/${this.datasetName}/versions/${this.datasetVersion}/files/${encodeURIComponent(filename)}/url`;
    const response = await fetch(url, {
      headers: { Authorization: this.apiKey },
      cache: "no-store"
    });

    if (!response.ok) {
      throw new WeatherProviderError(
        `KNMI downloadlink kon niet worden gemaakt (${response.status}).`,
        "KNMI",
        "download_url_failed"
      );
    }

    const payload = (await response.json()) as { temporaryDownloadUrl?: string };
    if (!payload.temporaryDownloadUrl) {
      throw new WeatherProviderError("KNMI gaf geen tijdelijke download-URL terug.", "KNMI", "no_download_url");
    }

    const fileResponse = await fetch(payload.temporaryDownloadUrl, { cache: "no-store" });
    if (!fileResponse.ok) {
      throw new WeatherProviderError(
        `KNMI HDF5-bestand kon niet worden gedownload (${fileResponse.status}).`,
        "KNMI",
        "download_failed"
      );
    }

    return Buffer.from(await fileResponse.arrayBuffer());
  }
}
