import { NextResponse } from "next/server";
import { isSupabaseStorageConfigured } from "@/lib/storage/supabaseStorage";

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "rain-alert",
    supabaseStorageConfigured: isSupabaseStorageConfigured(),
    timestamp: new Date().toISOString()
  });
}
