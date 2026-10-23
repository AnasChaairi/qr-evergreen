import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { KitLinksForm, PrintPackPanel } from "@/components/ReviewKitForms";
import { AppHeader } from "@/components/SiteChrome";
import { DASHBOARD } from "@/content/dashboard";
import { REVIEW, reviewClientStrings } from "@/content/review";
import { SITE_URL, isLocale } from "@/lib/i18n";
import { requireAccount } from "@/lib/dynamic/account";
import { shortUrl } from "@/lib/dynamic/slug";
import { daysAgo } from "@/lib/dynamic/time";
import { designsForPlan, normalizeColor, type ExtraLink, type PrintItemId } from "@/lib/review/kit";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata({ params }: PageProps<"/[lang]/dashboard/review-kits/[id]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return { title: REVIEW[lang].metaTitle, robots: { index: false } };
}

export default async function ReviewKitPage({ params }: PageProps<"/[lang]/dashboard/review-kits/[id]">) {
  const { lang, id } = await params;
  if (!isLocale(lang)) notFound();
  const t = REVIEW[lang];
  const errors = { ...DASHBOARD[lang].errors, ...t.errors };
  const account = await requireAccount(lang);
  const supabase = await createClient();

  const { data: kit } = await supabase
    .from("review_kits")
    .select("id, business_name, review_url, google_place_id, extra_links, brand, qr_code_id, qr_codes(short_slug)")
    .eq("id", id)
    .maybeSingle();
  if (!kit || !kit.qr_code_id) notFound();
  const slug = (kit.qr_codes as unknown as { short_slug: string }).short_slug;
  const extras = (kit.extra_links ?? []) as ExtraLink[];
  const color = normalizeColor((kit.brand as { color?: string } | null)?.color);

  const { data: sources } = await supabase.rpc("scan_source_counts", { code_id: kit.qr_code_id, since: daysAgo(30).toISOString() });
  const prefix = lang === "fr" ? "/fr" : "";
  const link = shortUrl(slug);

  return (
    <>
      <AppHeader locale={lang} path={`/dashboard/review-kits/${kit.id}`} signedIn />
      <main id="main" className="mx-auto w-full max-w-4xl flex-1 space-y-8 px-4 py-8">
        <Link href={`${prefix}/dashboard/review-kits`} className="text-sm text-brand-700 underline">
          ← {t.kit.back}
        </Link>
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-stone-900">{kit.business_name}</h1>
          <p className="text-sm text-stone-600">
            {t.kit.shortLink}: <span className="font-mono">{link}</span>
          </p>
          {extras.length > 0 && (
            <p className="text-sm text-stone-600">
              {t.kit.publicPage}:{" "}
              <a href={`${SITE_URL}/r/${slug}`} className="text-brand-700 underline">
                {`${SITE_URL}/r/${slug}`}
              </a>
            </p>
          )}
        </div>

        <PrintPackPanel
          businessName={kit.business_name}
          shortUrl={link}
          color={color}
          allowed={designsForPlan(account.plan)}
          t={reviewClientStrings(lang)}
          locale={lang}
        />

        <section className="space-y-3 rounded-2xl border border-stone-200 bg-white p-4 sm:p-6">
          <h2 className="font-semibold text-stone-900">{t.kit.scansByItem}</h2>
          {sources && sources.length > 0 ? (
            <ul className="space-y-1 text-sm">
              {(sources as { source: string; scans: number }[]).map((row) => (
                <li key={row.source} className="flex justify-between text-stone-700">
                  <span>{t.items[row.source as PrintItemId | "direct"] ?? row.source}</span>
                  <span className="font-medium">{row.scans}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-stone-600">{t.kit.noScans}</p>
          )}
        </section>

        <section className="space-y-4 rounded-2xl border border-stone-200 bg-white p-4 sm:p-6">
          <KitLinksForm locale={lang} id={kit.id} review={kit.google_place_id ?? kit.review_url} extras={extras} t={reviewClientStrings(lang)} errors={errors} />
        </section>
      </main>
    </>
  );
}
