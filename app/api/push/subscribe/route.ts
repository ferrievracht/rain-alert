import { NextRequest, NextResponse } from "next/server";
import { getOrCreateDemoUser, savePushSubscription } from "@/lib/db/queries";
import { pushSubscriptionInputSchema } from "@/lib/db/schema";

export async function POST(request: NextRequest) {
  try {
    const user = await getOrCreateDemoUser(request.headers.get("user-agent"));
    const parsed = pushSubscriptionInputSchema.parse(await request.json());
    const subscription = await savePushSubscription(
      { ...parsed, userAgent: request.headers.get("user-agent") },
      user.id
    );
    return NextResponse.json({ subscription });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Push subscription ongeldig." },
      { status: 400 }
    );
  }
}
