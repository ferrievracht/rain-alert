import "server-only";

import webpush from "web-push";
import { memoryStore } from "@/lib/db/memoryStore";

export function configureWebPush() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || "mailto:ops@example.org";

  if (!publicKey || !privateKey) {
    throw new Error("VAPID keys ontbreken. Zet NEXT_PUBLIC_VAPID_PUBLIC_KEY en VAPID_PRIVATE_KEY.");
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);
}

export async function sendPushToUser(
  userId: string,
  payload: { title: string; body: string; url: string; locationId?: string }
) {
  configureWebPush();
  const subscriptions = memoryStore.pushSubscriptions.filter((item) => item.userId === userId);
  const results = await Promise.allSettled(
    subscriptions.map((subscription) =>
      webpush.sendNotification(
        {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.p256dh,
            auth: subscription.auth
          }
        },
        JSON.stringify(payload)
      )
    )
  );

  subscriptions.forEach((subscription) => {
    subscription.lastUsedAt = new Date();
  });

  return results;
}
