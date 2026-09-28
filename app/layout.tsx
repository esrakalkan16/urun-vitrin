import type { Metadata, Viewport } from "next";
import { Funnel_Display, Funnel_Sans } from "next/font/google";
import "./globals.css";

const funnelSans = Funnel_Sans({ subsets: ["latin", "latin-ext"], variable: "--font-funnel-sans", display: "swap" });
const funnelDisplay = Funnel_Display({
  subsets: ["latin", "latin-ext"],
  variable: "--font-funnel-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "L'Atelier Enfant — Butik Çocuk Gardırobu",
  description:
    "Özenle seçilmiş, doğal liflerden çocuk kıyafetleri. Organik pamuk, keten ve yumuşak trikolar.",
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={`h-full antialiased ${funnelSans.variable} ${funnelDisplay.variable}`}>
      <body className="flex min-h-full flex-col bg-canvas font-sans text-ink">{children}</body>
    </html>
  );
}
