import type { MetadataRoute } from "next";
import { LOCALES, SLUGS, absoluteUrl, pathFor, type PageId } from "@/lib/i18n";

const PAGES: PageId[] = ["home", ...(Object.keys(SLUGS) as PageId[])];

export default function sitemap(): MetadataRoute.Sitemap {
  return PAGES.flatMap((page) =>
    LOCALES.map((locale) => ({
      url: absoluteUrl(pathFor(locale, page)),
      changeFrequency: "monthly" as const,
      priority: page === "home" ? 1 : ["privacy", "terms", "about", "contact"].includes(page) ? 0.3 : 0.8,
      alternates: {
        languages: Object.fromEntries(LOCALES.map((l) => [l, absoluteUrl(pathFor(l, page))])),
      },
    })),
  );
}
