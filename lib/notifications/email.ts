import "server-only";

type MailerSendMessage = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

export function isMailerSendConfigured() {
  return Boolean(process.env.MAILERSEND_API_TOKEN && process.env.MAILERSEND_FROM_EMAIL);
}

export async function sendMailerSendEmail(message: MailerSendMessage) {
  const token = process.env.MAILERSEND_API_TOKEN;
  const fromEmail = process.env.MAILERSEND_FROM_EMAIL;
  const fromName = process.env.MAILERSEND_FROM_NAME || "Rain Alert";

  if (!token || !fromEmail) {
    throw new Error("MailerSend ontbreekt. Zet MAILERSEND_API_TOKEN en MAILERSEND_FROM_EMAIL server-side.");
  }

  const response = await fetch("https://api.mailersend.com/v1/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      from: { email: fromEmail, name: fromName },
      to: [{ email: message.to }],
      subject: message.subject,
      text: message.text,
      html: message.html || message.text.replace(/\n/g, "<br />")
    })
  });

  if (!response.ok) {
    const details = await response.text().catch(() => "");
    throw new Error(`MailerSend verzending faalde (${response.status}). ${details}`.trim());
  }

  return { ok: true, status: response.status };
}

export async function sendRainAlertEmail(input: {
  to: string;
  title: string;
  body: string;
  locationUrl: string;
}) {
  const text = `${input.body}\n\nBekijk de locatie: ${input.locationUrl}\n\nWeerdata: KNMI Data Platform, met Open-Meteo fallback.`;
  return sendMailerSendEmail({
    to: input.to,
    subject: input.title,
    text,
    html: `
      <div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;line-height:1.6;color:#17212b">
        <h1 style="font-size:22px;margin:0 0 12px">${input.title}</h1>
        <p>${input.body}</p>
        <p><a href="${input.locationUrl}">Bekijk locatie in Rain Alert</a></p>
        <p style="color:#44576d;font-size:13px">Weerdata: KNMI Data Platform, met Open-Meteo fallback.</p>
      </div>
    `
  });
}
