import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import { notFound } from "next/navigation";
import { Footer } from "@/components/SiteChrome";
import { LOCALES, SITE_URL, isLocale } from "@/lib/i18n";
import "../globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

const PLAUSIBLE_DOMAIN = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: "QR Evergreen",
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = { themeColor: "#166534" };

export const dynamicParams = false;

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return (
    <html lang={lang} className={`${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        {children}
        <Footer locale={lang} />
        {PLAUSIBLE_DOMAIN && (
          <Script defer data-domain={PLAUSIBLE_DOMAIN} src="https://plausible.io/js/script.js" strategy="afterInteractive" />
        )}
        {ADSENSE_CLIENT && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  );
}
