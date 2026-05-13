import { NextRequest, NextResponse } from "next/server";
import { createLocation, getOrCreateDemoUser, listLocations } from "@/lib/db/queries";

export async function GET(request: NextRequest) {
  const user = await getOrCreateDemoUser(request.headers.get("user-agent"));
  return NextResponse.json({ locations: await listLocations(user.id) });
}

export async function POST(request: NextRequest) {
  try {
    const user = await getOrCreateDemoUser(request.headers.get("user-agent"));
    const location = await createLocation(await request.json(), user.id);
    return NextResponse.json({ location }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Locatie kon niet worden opgeslagen." },
      { status: 400 }
    );
  }
}
