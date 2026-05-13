import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rain Alert",
  description: "Ontvang een melding voordat regen aankomt op jouw gekozen locatie.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "Rain Alert",
    statusBarStyle: "default"
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1b75bb"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <body className="rain-shell">{children}</body>
    </html>
  );
}
