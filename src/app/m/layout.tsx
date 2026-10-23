import type { Metadata } from "next";
import "../globals.css";

// Public menu pages are seen by a restaurant's customers: no ads, no site chrome.
export const metadata: Metadata = { robots: { index: false }, icons: { icon: "/icon.svg" } };

export default function MenuLayout({ children }: LayoutProps<"/m">) {
  return (
    <html lang="en">
      <body className="min-h-full bg-stone-50 font-sans antialiased">{children}</body>
    </html>
  );
}
