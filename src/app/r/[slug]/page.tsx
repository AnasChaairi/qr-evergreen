import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { REVIEW } from "@/content/review";
import { isLocale } from "@/lib/i18n";
import { SLUG_PATTERN } from "@/lib/dynamic/slug";
import { normalizeColor, type ExtraLink } from "@/lib/review/kit";
import { createAdminClient } from "@/lib/supabase/admin";

// Every visitor sees the same links: Google first, then any other platforms.
// There is deliberately no "how was your visit?" filter (review gating).

const loadKit = cache(async (slug: string) => {
  if (!SLUG_PATTERN.test(slug)) return null;
  const { data } = await createAdminClient()
    .from("qr_codes")
    .select("is_active, review_kits(business_name, review_url, extra_links, brand)")
    .eq("short_slug", slug)
    .eq("type", "review")
    .maybeSingle();
  const kit = (data?.review_kits as unknown as { business_name: string; review_url: string; extra_links: ExtraLink[]; brand: { color?: string; locale?: string } }[] | null)?.[0];
  if (!data?.is_active || !kit) return null;
  const locale = kit.brand?.locale && isLocale(kit.brand.locale) ? kit.brand.locale : "en";
  return { ...kit, locale, color: normalizeColor(kit.brand?.color) };
});

export async function generateMetadata({ params }: PageProps<"/r/[slug]">): Promise<Metadata> {
  const kit = await loadKit((await params).slug);
  return kit ? { title: REVIEW[kit.locale].publicPage.title(kit.business_name) } : {};
}

export default async function PublicReviewPage({ params }: PageProps<"/r/[slug]">) {
  const kit = await loadKit((await params).slug);
  if (!kit) notFound();
  const t = REVIEW[kit.locale];

  return (
    <main lang={kit.locale} className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 px-4 py-12">
      <div className="space-y-2 text-center">
        <p aria-hidden="true" className="text-3xl tracking-widest text-amber-500">★★★★★</p>
        <h1 className="text-2xl font-bold text-stone-900">{kit.business_name}</h1>
        <p className="text-stone-600">{t.publicPage.intro}</p>
      </div>
      <a
        href={kit.review_url}
        rel="noopener"
        className="block rounded-xl px-5 py-4 text-center text-lg font-semibold text-white shadow-sm"
        style={{ backgroundColor: kit.color }}
      >
        {t.publicPage.google}
      </a>
      {kit.extra_links.length > 0 && (
        <div className="space-y-3">
          <p className="text-center text-sm text-stone-500">{t.publicPage.others}</p>
          {kit.extra_links.map((link) => (
            <a
              key={link.platform}
              href={link.url}
              rel="noopener"
              className="block rounded-xl border border-stone-300 bg-white px-5 py-3 text-center font-medium text-stone-800"
            >
              {t.platforms[link.platform]}
            </a>
          ))}
        </div>
      )}
      <p className="text-center text-sm text-stone-500">{t.publicPage.thanks}</p>
    </main>
  );
}
