import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Qazyna — Қазақстанның цифрлық ортасы",
  description: "Қазақстанға арналған жергілікті әлеуметтік желі: чаттар, қауымдастықтар және тексерілген қызметтер.",
  applicationName: "Qazyna",
  manifest: "/manifest.webmanifest",
  formatDetection: { telephone: false },
  other: { "codex-preview": "development" },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg", apple: "/favicon.svg" },
};

export const viewport: Viewport = { themeColor: "#102F35", width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="kk"><body>{children}</body></html>;
}
