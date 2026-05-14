import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cachedClient: SupabaseClient | null = null;

export function isSupabaseStorageConfigured() {
  return Boolean(
    process.env.SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY &&
      process.env.SUPABASE_STORAGE_BUCKET
  );
}

function getSupabaseServiceClient() {
  if (!isSupabaseStorageConfigured()) return null;
  if (!cachedClient) {
    cachedClient = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      }
    );
  }
  return cachedClient;
}

export class SupabaseNowcastStorage {
  private readonly prefix = process.env.SUPABASE_STORAGE_KNMI_PREFIX || "knmi-nowcast";

  isConfigured() {
    return isSupabaseStorageConfigured();
  }

  async downloadNowcast(filename: string) {
    const client = getSupabaseServiceClient();
    const bucket = process.env.SUPABASE_STORAGE_BUCKET;
    if (!client || !bucket) return null;

    const { data, error } = await client.storage
      .from(bucket)
      .download(this.pathFor(filename));

    if (error || !data) return null;

    return Buffer.from(await data.arrayBuffer());
  }

  async uploadNowcast(filename: string, buffer: Buffer) {
    const client = getSupabaseServiceClient();
    const bucket = process.env.SUPABASE_STORAGE_BUCKET;
    if (!client || !bucket) return false;

    const { error } = await client.storage
      .from(bucket)
      .upload(this.pathFor(filename), buffer, {
        contentType: "application/x-hdf5",
        upsert: true
      });

    return !error;
  }

  private pathFor(filename: string) {
    return `${this.prefix}/${filename}`;
  }
}
