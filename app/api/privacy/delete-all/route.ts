import { NextResponse } from "next/server";
import { deleteAllUserData } from "@/lib/db/queries";

export async function POST() {
  await deleteAllUserData("demo-user");
  return NextResponse.json({ ok: true });
}
