// Review QR kit: print items, designs and links. Pure, shared by server and browser.

import type { Plan } from "@/lib/dynamic/plans";

export const PRINT_ITEMS = [
  { id: "counter-stand", widthMm: 105, heightMm: 148 }, // A6 portrait
  { id: "table-tent", widthMm: 148, heightMm: 210 }, // A5, folds into two A6 faces
  { id: "window-sticker", widthMm: 120, heightMm: 120 },
  { id: "receipt-card", widthMm: 85, heightMm: 55 }, // business-card size
  { id: "staff-badge", widthMm: 54, heightMm: 86 },
] as const;

export type PrintItemId = (typeof PRINT_ITEMS)[number]["id"];

export const PRINT_DESIGNS = ["classic", "minimal", "bold", "split"] as const;
export type PrintDesign = (typeof PRINT_DESIGNS)[number];

// Free plan: two designs. Paid plans: all of them.
export function designsForPlan(plan: Plan): PrintDesign[] {
  return plan === "free" ? ["classic", "minimal"] : [...PRINT_DESIGNS];
}

export const EXTRA_PLATFORMS = ["tripadvisor", "facebook", "trustpilot", "booking"] as const;
export type ExtraPlatform = (typeof EXTRA_PLATFORMS)[number];
export type ExtraLink = { platform: ExtraPlatform; url: string };

// TripAdvisor uses country domains (tripadvisor.fr, tripadvisor.co.uk).
const PLATFORM_HOSTS: Record<ExtraPlatform, RegExp> = {
  tripadvisor: /^(?:[\w-]+\.)*tripadvisor\.(?:[a-z]{2,3}|co\.[a-z]{2}|com\.[a-z]{2})$/,
  facebook: /^(?:[\w-]+\.)*(?:facebook\.com|fb\.com)$/,
  trustpilot: /^(?:[\w-]+\.)*trustpilot\.com$/,
  booking: /^(?:[\w-]+\.)*booking\.com$/,
};

// An extra link must be on the platform it claims to be.
export function isPlatformUrl(platform: ExtraPlatform, url: string): boolean {
  try {
    return PLATFORM_HOSTS[platform].test(new URL(url).hostname.toLowerCase());
  } catch {
    return false;
  }
}

// With no extra platforms the code goes straight to Google's review form (one
// less tap); otherwise to our page listing Google first, then the others.
export function kitDestination(reviewUrl: string, extras: ExtraLink[], publicPageUrl: string): string {
  return extras.length === 0 ? reviewUrl : publicPageUrl;
}

export function itemLink(shortUrl: string, item: PrintItemId): string {
  return `${shortUrl}?s=${item}`;
}

export const DEFAULT_BRAND_COLOR = "#0f6b45";

export function normalizeColor(value: string | undefined | null): string {
  return value && /^#[0-9a-f]{6}$/i.test(value) ? value.toLowerCase() : DEFAULT_BRAND_COLOR;
}
