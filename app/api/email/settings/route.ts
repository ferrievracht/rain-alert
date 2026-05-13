import { NextRequest, NextResponse } from "next/server";
import { getEmailSettings, getOrCreateDemoUser, updateEmailSettings } from "@/lib/db/queries";
import { isMailerSendConfigured } from "@/lib/notifications/email";

export async function GET(request: NextRequest) {
  const user = await getOrCreateDemoUser(request.headers.get("user-agent"));
  return NextResponse.json({
    settings: await getEmailSettings(user.id),
    mailerSendConfigured: isMailerSendConfigured()
  });
}

export async function POST(request: NextRequest) {
  try {
    const user = await getOrCreateDemoUser(request.headers.get("user-agent"));
    const settings = await updateEmailSettings(await request.json(), user.id);
    return NextResponse.json({ settings, mailerSendConfigured: isMailerSendConfigured() });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "E-mailinstellingen zijn ongeldig." },
      { status: 400 }
    );
  }
}
