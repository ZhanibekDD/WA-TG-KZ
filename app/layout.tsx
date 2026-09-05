import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./whatsapp-parity.css";
import "./whatsapp-lock.css";
import "./whatsapp-desktop-lock.css";

export const metadata: Metadata = {
  title: "Qazyna — мессенджер",
  description: "Прототип мессенджера: привычные чаты, группы, каналы и избранное. Русский и қазақша.",
  applicationName: "Qazyna",
  manifest: "/manifest.webmanifest",
  formatDetection: { telephone: false },
  other: { "codex-preview": "development" },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg", apple: "/favicon.svg" },
};

export const viewport: Viewport = { themeColor: "#ffffff", width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ru"><body>{children}</body></html>;
}
