import { NextRequest, NextResponse } from "next/server";
import { memoryStore } from "@/lib/db/memoryStore";
import { sendPushToUser } from "@/lib/notifications/push";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as { locationId?: string };
    const location = body.locationId
      ? memoryStore.locations.find((item) => item.id === body.locationId)
      : memoryStore.locations[0];
    await sendPushToUser("demo-user", {
      title: location ? `Regen verwacht bij ${location.name}` : "Rain Alert testmelding",
      body: "Dit is een testmelding van Rain Alert.",
      url: location ? `/locations/${location.id}` : "/dashboard",
      locationId: location?.id
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Testmelding kon niet worden verstuurd." },
      { status: 400 }
    );
  }
}
