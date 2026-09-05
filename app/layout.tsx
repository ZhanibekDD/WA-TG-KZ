import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./whatsapp-parity.css";
import "./whatsapp-lock.css";
import "./whatsapp-desktop-lock.css";
import "./whatsapp-strict-2026.css";
import "./qazyna-brand.css";

export const metadata: Metadata = {
  title: "Qazyna — мессенджер",
  description: "Qazyna — удобный мессенджер и платформа для чатов, сообществ, каналов, ботов и мини-приложений. Русский и қазақша.",
  applicationName: "Qazyna",
  manifest: "/manifest.webmanifest",
  formatDetection: { telephone: false },
  other: { "codex-preview": "development" },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg", apple: "/favicon.svg" },
};

export const viewport: Viewport = { themeColor: "#5b5bd6", width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ru"><body>{children}</body></html>;
}
