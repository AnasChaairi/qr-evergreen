import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CreateKitForm } from "@/components/ReviewKitForms";
import { AppHeader } from "@/components/SiteChrome";
import { DASHBOARD } from "@/content/dashboard";
import { REVIEW, reviewClientStrings } from "@/content/review";
import { isLocale } from "@/lib/i18n";
import { requireAccount } from "@/lib/dynamic/account";
import { PLAN_LIMITS } from "@/lib/dynamic/plans";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata({ params }: PageProps<"/[lang]/dashboard/review-kits">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return { title: REVIEW[lang].metaTitle, robots: { index: false } };
}

export default async function ReviewKitsPage({ params }: PageProps<"/[lang]/dashboard/review-kits">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = REVIEW[lang];
  const errors = { ...DASHBOARD[lang].errors, ...t.errors };
  const account = await requireAccount(lang);
  const supabase = await createClient();

  const [{ data: kits }, { count: codeCount }] = await Promise.all([
    supabase.from("review_kits").select("id, business_name, review_url, created_at").eq("workspace_id", account.workspaceId).order("created_at", { ascending: false }),
    supabase.from("qr_codes").select("id", { count: "exact", head: true }).eq("workspace_id", account.workspaceId),
  ]);
  const limits = PLAN_LIMITS[account.plan];
  const atLimit = (kits?.length ?? 0) >= limits.reviewKits || (codeCount ?? 0) >= limits.dynamicCodes;
  const prefix = lang === "fr" ? "/fr" : "";

  return (
    <>
      <AppHeader locale={lang} path="/dashboard/review-kits" signedIn />
      <main id="main" className="mx-auto w-full max-w-4xl flex-1 space-y-8 px-4 py-10 sm:px-6">
        <div className="space-y-2">
          <h1 className="page-title">{t.h1}</h1>
          <p className="text-[17px] text-stone-600">{t.intro}</p>
        </div>

        {kits && kits.length > 0 ? (
          <ul className="divide-y divide-stone-200 overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-soft">
            {kits.map((kit) => (
              <li key={kit.id}>
                <Link href={`${prefix}/dashboard/review-kits/${kit.id}`} className="flex items-center justify-between gap-4 p-5 transition-colors hover:bg-brand-50">
                  <span className="font-medium text-stone-900">{kit.business_name}</span>
                  <span className="text-sm text-brand-700">{t.list.open} →</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[17px] text-stone-600">{t.list.empty}</p>
        )}

        {atLimit ? (
          <p className="text-[15px] text-stone-600">{t.errors.kitLimit}</p>
        ) : (
          <CreateKitForm locale={lang} t={reviewClientStrings(lang)} errors={errors} disabled={atLimit} />
        )}
      </main>
    </>
  );
}
