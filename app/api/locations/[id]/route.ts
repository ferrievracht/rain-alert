import { NextRequest, NextResponse } from "next/server";
import { deleteLocation, getLocation, updateLocation } from "@/lib/db/queries";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const location = await getLocation(params.id);
  if (!location) return NextResponse.json({ error: "Locatie niet gevonden." }, { status: 404 });
  return NextResponse.json({ location });
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const location = await updateLocation(params.id, await request.json());
    if (!location) return NextResponse.json({ error: "Locatie niet gevonden." }, { status: 404 });
    return NextResponse.json({ location });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Locatie kon niet worden gewijzigd." },
      { status: 400 }
    );
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  await deleteLocation(params.id);
  return NextResponse.json({ ok: true });
}
