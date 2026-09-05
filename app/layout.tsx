import type { Metadata, Viewport } from "next";
import { JeliStoriesDock } from "@/components/jeli-stories-dock";
import "./globals.css";
import "./whatsapp-parity.css";
import "./whatsapp-lock.css";
import "./whatsapp-desktop-lock.css";
import "./whatsapp-strict-2026.css";
import "./qazyna-brand.css";
import "./product-teal.css";
import "./jeli-stories.css";
import "./jeli-logo-lock.css";

export const metadata: Metadata = {
  title: "JELI — мессенджер",
  description: "JELI — удобный мессенджер и платформа для чатов, Stories, сообществ, каналов, ботов и Mini Apps. Русский и қазақша.",
  applicationName: "JELI",
  manifest: "/manifest.webmanifest",
  formatDetection: { telephone: false },
  other: { "codex-preview": "development" },
  icons: { icon: "/jeli-icon.png", shortcut: "/jeli-icon.png", apple: "/jeli-icon.png" },
};

export const viewport: Viewport = { themeColor: "#18b5ad", width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ru"><body>{children}<JeliStoriesDock /></body></html>;
}