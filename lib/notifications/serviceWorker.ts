export function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

export async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return null;
  return navigator.serviceWorker.register("/service-worker.js");
}

export type PushSubscribeResult =
  | { ok: true; subscription: PushSubscription }
  | { ok: false; code: "unsupported" | "denied" | "missing_vapid_key" | "save_failed"; message: string };

export async function subscribeToPush() {
  const registration = await registerServiceWorker();
  if (!registration || !("PushManager" in window)) {
    return {
      ok: false,
      code: "unsupported",
      message: "Pushmeldingen worden niet ondersteund in deze browser."
    } satisfies PushSubscribeResult;
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    return {
      ok: false,
      code: "denied",
      message: "Pushmeldingen zijn niet toegestaan. Zet notificaties aan in je browserinstellingen."
    } satisfies PushSubscribeResult;
  }

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!publicKey) {
    return {
      ok: false,
      code: "missing_vapid_key",
      message: "VAPID public key ontbreekt. Voeg NEXT_PUBLIC_VAPID_PUBLIC_KEY toe aan de environment."
    } satisfies PushSubscribeResult;
  }

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicKey)
  });

  const response = await fetch("/api/push/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(subscription)
  });

  if (!response.ok) {
    return {
      ok: false,
      code: "save_failed",
      message: "Push subscription kon niet worden opgeslagen."
    } satisfies PushSubscribeResult;
  }

  return { ok: true, subscription } satisfies PushSubscribeResult;
}
