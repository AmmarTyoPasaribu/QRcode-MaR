import type { Metadata, Viewport } from "next";
import NatureScene from "@/components/scene/NatureScene";
import { THEME_SCRIPT } from "@/components/layout/ThemeToggle";
import { SITE } from "@/config/site";
import { fraunces, jakarta } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — ${SITE.tagline}`,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  authors: [{ name: SITE.author }],
  keywords: ["QR code", "generator QR", "buat QR code", "QR WiFi", "QR WhatsApp", "QR logo", "QR SVG"],
  openGraph: {
    type: "website",
    locale: "id_ID",
    title: SITE.name,
    description: SITE.description,
    siteName: SITE.name,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.name,
    description: SITE.description,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#e3eedf" },
    { media: "(prefers-color-scheme: dark)", color: "#08140f" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" className={`${jakarta.variable} ${fraunces.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>
        <a href="#generator" className="skip-link">
          Langsung ke generator
        </a>
        <NatureScene />
        <div className="page">{children}</div>
      </body>
    </html>
  );
}
