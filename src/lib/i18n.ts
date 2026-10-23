// Locales and URLs. English lives at the site root, French under /fr/ with
// translated slugs. src/proxy.ts rewrites root URLs to the internal /en route.

export const LOCALES = ["en", "fr"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

export type PageId =
  | "home"
  | "wifi"
  | "url"
  | "whatsapp"
  | "review"
  | "vcard"
  | "privacy"
  | "terms"
  | "about"
  | "contact"
  | "pricing";

export const SLUGS: Record<Exclude<PageId, "home">, Record<Locale, string>> = {
  wifi: { en: "wifi-qr-code", fr: "qr-code-wifi" },
  url: { en: "url-qr-code", fr: "qr-code-lien" },
  whatsapp: { en: "whatsapp-qr-code", fr: "qr-code-whatsapp" },
  review: { en: "google-review-qr-code", fr: "qr-code-avis-google" },
  vcard: { en: "vcard-qr-code", fr: "qr-code-vcard" },
  privacy: { en: "privacy", fr: "confidentialite" },
  terms: { en: "terms", fr: "conditions" },
  about: { en: "about", fr: "a-propos" },
  contact: { en: "contact", fr: "contact" },
  pricing: { en: "pricing", fr: "tarifs" },
};

export function pageIdFromSlug(locale: Locale, slug: string): Exclude<PageId, "home"> | null {
  const entry = Object.entries(SLUGS).find(([, slugs]) => slugs[locale] === slug);
  return entry ? (entry[0] as Exclude<PageId, "home">) : null;
}

// Public path for a page, e.g. pathFor("fr", "wifi") -> "/fr/qr-code-wifi".
export function pathFor(locale: Locale, page: PageId): string {
  const prefix = locale === DEFAULT_LOCALE ? "" : `/${locale}`;
  if (page === "home") return prefix || "/";
  return `${prefix}/${SLUGS[page][locale]}`;
}

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://qrevergreen.com").replace(/\/$/, "");

export function absoluteUrl(path: string): string {
  return path === "/" ? `${SITE_URL}/` : `${SITE_URL}${path}`;
}

// hreflang alternates for a page in every locale.
export function alternatesFor(locale: Locale, page: PageId) {
  return {
    canonical: absoluteUrl(pathFor(locale, page)),
    languages: {
      ...Object.fromEntries(LOCALES.map((l) => [l, absoluteUrl(pathFor(l, page))])),
      "x-default": absoluteUrl(pathFor(DEFAULT_LOCALE, page)),
    },
  };
}
