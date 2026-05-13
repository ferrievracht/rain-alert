import { NextRequest, NextResponse } from "next/server";
import { getEmailSettings } from "@/lib/db/queries";
import { sendRainAlertEmail } from "@/lib/notifications/email";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as { email?: string };
    const settings = await getEmailSettings("demo-user");
    const to = body.email || settings.email;

    if (!to) {
      return NextResponse.json({ error: "Vul eerst een e-mailadres in." }, { status: 400 });
    }

    await sendRainAlertEmail({
      to,
      title: "Rain Alert testmail",
      body: "Dit is een testmail van Rain Alert via MailerSend.",
      locationUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://127.0.0.1:3000"}/dashboard`
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Testmail kon niet worden verstuurd." },
      { status: 400 }
    );
  }
}
