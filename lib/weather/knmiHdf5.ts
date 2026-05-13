import "server-only";

import { WeatherProviderError } from "./WeatherProvider";
import { latLonToGridIndex, parseBounds } from "./geo";

type Hdf5Slot = {
  timestamp: Date;
  precipitationMmPerHour: number;
};

type NumericArrayLike = {
  value: unknown;
  shape?: number[];
};

type Hdf5FileLike = {
  get: (key: string) => unknown;
  keys?: () => string[];
  close: () => void;
};

function readTimestampFromFilename(filename: string) {
  const match = filename.match(/(\d{8})[T_-]?(\d{4,6})?/);
  if (!match) return new Date();
  const [, date, time = "000000"] = match;
  const year = date.slice(0, 4);
  const month = date.slice(4, 6);
  const day = date.slice(6, 8);
  const hour = time.slice(0, 2).padEnd(2, "0");
  const minute = time.slice(2, 4).padEnd(2, "0");
  const second = time.slice(4, 6).padEnd(2, "0");
  return new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}Z`);
}

function valueAt(data: ArrayLike<number>, shape: number[], time: number, y: number, x: number) {
  if (shape.length === 3) {
    const [, height, width] = shape;
    return data[time * height * width + y * width + x];
  }
  if (shape.length === 2) {
    const [, width] = shape;
    return data[y * width + x];
  }
  return data[time] ?? 0;
}

export async function decodeKnmiHdf5Point(
  buffer: Buffer,
  filename: string,
  latitude: number,
  longitude: number
): Promise<Hdf5Slot[]> {
  let h5wasm: typeof import("h5wasm/node");
  try {
    h5wasm = await import("h5wasm/node");
  } catch (error) {
    throw new WeatherProviderError(
      "HDF5-decoder ontbreekt. Installeer de optionele dependency h5wasm of gebruik Open-Meteo fallback.",
      "KNMI",
      "hdf5_decoder_missing",
      error
    );
  }

  await h5wasm.ready;
  const Hdf5File = h5wasm.File as unknown as new (source: unknown, mode: string) => Hdf5FileLike;
  const file = new Hdf5File(new Uint8Array(buffer), "r");
  try {
    const datasetPath = process.env.KNMI_HDF5_DATASET_PATH || discoverFirstNumericDataset(file);
    const dataset = file.get(datasetPath) as NumericArrayLike;
    const shape = dataset.shape || [];
    const value = dataset.value;

    if (!ArrayBuffer.isView(value) || shape.length < 2) {
      throw new Error(`Dataset ${datasetPath} is geen verwacht raster.`);
    }

    const timeSteps = shape.length === 3 ? shape[0] : 25;
    const height = shape.length === 3 ? shape[1] : shape[0];
    const width = shape.length === 3 ? shape[2] : shape[1];
    const bounds = parseBounds(process.env.KNMI_GRID_BOUNDS);
    const { x, y } = latLonToGridIndex(latitude, longitude, width, height, bounds);
    const baseTime = readTimestampFromFilename(filename);

    return Array.from({ length: Math.min(timeSteps, 25) }, (_, step) => {
      const fiveMinuteSumMm = Number(valueAt(value as unknown as ArrayLike<number>, shape, step, y, x));
      return {
        timestamp: new Date(baseTime.getTime() + step * 5 * 60 * 1000),
        precipitationMmPerHour: Math.max(0, fiveMinuteSumMm * 12)
      };
    });
  } catch (error) {
    throw new WeatherProviderError(
      "KNMI HDF5-raster kon niet worden gelezen. Controleer KNMI_HDF5_DATASET_PATH en gridmetadata.",
      "KNMI",
      "hdf5_parse_failed",
      error
    );
  } finally {
    file.close();
  }
}

function discoverFirstNumericDataset(group: unknown, prefix = ""): string {
  const anyGroup = group as {
    keys?: () => string[];
    get?: (key: string) => unknown;
    shape?: number[];
    value?: unknown;
  };

  if (anyGroup.shape && ArrayBuffer.isView(anyGroup.value)) return prefix || "/";

  for (const key of anyGroup.keys?.() || []) {
    const child = anyGroup.get?.(key);
    const path = `${prefix}/${key}`.replace("//", "/");
    const childAny = child as { shape?: number[]; value?: unknown };
    if (childAny?.shape && ArrayBuffer.isView(childAny.value)) return path;
    try {
      const found = discoverFirstNumericDataset(child, path);
      if (found) return found;
    } catch {
      // Keep searching siblings.
    }
  }

  throw new Error("Geen numerieke HDF5 dataset gevonden.");
}
