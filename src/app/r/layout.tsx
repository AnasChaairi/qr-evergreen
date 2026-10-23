import type { Metadata } from "next";
import { fontVariables } from "../fonts";
import "../globals.css";

// Public review pages are seen by a business's customers: no ads, no site chrome.
export const metadata: Metadata = { robots: { index: false }, icons: { icon: "/icon.svg" } };

export default function ReviewLayout({ children }: LayoutProps<"/r">) {
  return (
    <html lang="en" className={fontVariables}>
      <body className="min-h-full bg-stone-50 font-sans antialiased">{children}</body>
    </html>
  );
}
