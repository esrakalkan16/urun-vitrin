import type { Metadata, Viewport } from "next";
import { Funnel_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";

const funnelSans = Funnel_Sans({ subsets: ["latin", "latin-ext"], variable: "--font-funnel-sans", display: "swap" });
const playfair = Playfair_Display({
  subsets: ["latin", "latin-ext"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Veliaht Kids — Erkek Çocuk Giyim",
  description:
    "Küçük beyefendiler için özenle seçilmiş erkek çocuk kıyafetleri. Doğal kumaşlar, zamansız kesimler.",
};

export const viewport: Viewport = {
  themeColor: "#1f2a44",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={`h-full antialiased ${funnelSans.variable} ${playfair.variable}`}>
      <body className="flex min-h-full flex-col bg-canvas font-sans text-ink">{children}</body>
    </html>
  );
}
