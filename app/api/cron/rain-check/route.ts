import { NextRequest, NextResponse } from "next/server";
import { runRainCheckCycle } from "@/lib/scheduler/rainCheckWorker";

export async function POST(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results = await runRainCheckCycle();
  return NextResponse.json({ checked: results.length, results });
}
