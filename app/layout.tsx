import type { Metadata, Viewport } from "next";
import { JeliStoriesDock } from "@/components/jeli-stories-dock";
import { JeliDeepLinkBridge } from "@/components/jeli-deep-link-bridge";
import { BotJeliCommandBar } from "@/components/botjeli-command-bar";
import { JeliMessageReactions } from "@/components/jeli-message-reactions";
import { JeliCallOverlay } from "@/components/jeli-call-overlay";
import "./globals.css";
import "./whatsapp-parity.css";
import "./whatsapp-lock.css";
import "./whatsapp-desktop-lock.css";
import "./whatsapp-strict-2026.css";
import "./qazyna-brand.css";
import "./product-teal.css";
import "./jeli-stories.css";
import "./jeli-logo-lock.css";
import "./botjeli-lock.css";
import "./jeli-messenger-lock.css";
import "./jeli-interactions.css";
import "./jeli-chat-wallpaper.css";

export const metadata: Metadata = {
  title: "JELI — мессенджер",
  description: "JELI — удобный мессенджер и платформа для чатов, Stories, сообществ, каналов, ботов и Mini Apps. Русский и қазақша.",
  applicationName: "JELI",
  manifest: "/manifest.webmanifest",
  formatDetection: { telephone: false },
  other: { "codex-preview": "development" },
  icons: { icon: "/jeli-icon.svg", shortcut: "/jeli-icon.svg", apple: "/jeli-icon.svg" },
};

export const viewport: Viewport = { themeColor: "#18b5ad", width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ru"><body>{children}<JeliStoriesDock /><JeliDeepLinkBridge /><BotJeliCommandBar /><JeliMessageReactions /><JeliCallOverlay /></body></html>;
}
