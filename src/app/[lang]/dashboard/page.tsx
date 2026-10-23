import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CreateCodeForm } from "@/components/DashboardForms";
import { GridIcon } from "@/components/Icons";
import { AppHeader } from "@/components/SiteChrome";
import { DASHBOARD } from "@/content/dashboard";
import { isLocale } from "@/lib/i18n";
import { requireAccount } from "@/lib/dynamic/account";
import { PLAN_LIMITS } from "@/lib/dynamic/plans";
import { daysAgo } from "@/lib/dynamic/time";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata({ params }: PageProps<"/[lang]/dashboard">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return { title: DASHBOARD[lang].home.metaTitle, robots: { index: false } };
}

export default async function DashboardPage({ params }: PageProps<"/[lang]/dashboard">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = DASHBOARD[lang];
  const account = await requireAccount(lang);
  const supabase = await createClient();

  const { data: codes } = await supabase
    .from("qr_codes")
    .select("id, name, short_slug, destination_url, is_active, created_at")
    .eq("workspace_id", account.workspaceId)
    .order("created_at", { ascending: false });

  const ids = (codes ?? []).map((c) => c.id);
  const since = daysAgo(7).toISOString();
  const { data: counts } = ids.length
    ? await supabase.rpc("scan_daily_counts", { code_ids: ids, since })
    : { data: [] as { qr_code_id: string; scans: number }[] };
  const scansByCode = new Map<string, number>();
  for (const row of (counts ?? []) as { qr_code_id: string; scans: number }[]) {
    scansByCode.set(row.qr_code_id, (scansByCode.get(row.qr_code_id) ?? 0) + Number(row.scans));
  }

  const limit = PLAN_LIMITS[account.plan].dynamicCodes;
  const used = codes?.length ?? 0;
  const prefix = lang === "fr" ? "/fr" : "";

  return (
    <>
      <AppHeader locale={lang} path="/dashboard" signedIn />
      <main id="main" className="mx-auto w-full max-w-6xl flex-1 space-y-8 px-4 py-10 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h1 className="page-title">{t.home.h1}</h1>
          <div className="w-full max-w-xs space-y-2 rounded-2xl border border-stone-200 bg-white p-4">
            <p className="flex justify-between gap-3 text-[15px]">
              <span className="font-bold text-stone-900">{t.home.plan[account.plan]}</span>
              <span className="text-stone-600">{t.home.usage(used, limit)}</span>
            </p>
            <div className="h-2 overflow-hidden rounded-full bg-stone-200" aria-hidden="true">
              <div className="h-2 rounded-full bg-brand-600" style={{ width: `${Math.min(100, (used / Math.max(1, limit)) * 100)}%` }} />
            </div>
          </div>
        </div>
        <p className="notice">{t.home.promise}</p>

        <CreateCodeForm
          locale={lang}
          t={{
            newCode: t.home.newCode,
            name: t.home.name,
            namePlaceholder: t.home.namePlaceholder,
            destination: t.home.destination,
            destinationPlaceholder: t.home.destinationPlaceholder,
            create: t.home.create,
          }}
          errors={t.errors}
          disabled={used >= limit}
        />
        {used >= limit && <p className="text-[15px] text-stone-600">{t.home.limitReached}</p>}

        {used === 0 ? (
          <p className="rounded-3xl border-2 border-dashed border-stone-300 p-8 text-center text-[17px] text-stone-600">{t.home.empty}</p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {codes!.map((code) => (
              <li key={code.id} className="min-w-0">
                <Link
                  href={`${prefix}/dashboard/codes/${code.id}`}
                  className="flex h-full flex-col gap-4 rounded-3xl border border-stone-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-brand-700 hover:shadow-soft"
                >
                  <span className="flex items-start gap-4">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                      <GridIcon />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[17px] font-bold text-stone-900">
                        {code.name || code.short_slug}
                        {!code.is_active && (
                          <span className="ms-2 rounded-full bg-stone-200 px-2.5 py-0.5 text-xs font-semibold text-stone-700">{t.home.archived}</span>
                        )}
                      </span>
                      <span className="block truncate text-sm text-stone-500">{code.destination_url}</span>
                    </span>
                  </span>
                  <span className="mt-auto flex items-baseline gap-2 border-t border-stone-100 pt-3 text-[15px] text-stone-600">
                    <strong className="font-display text-2xl text-stone-900">{scansByCode.get(code.id) ?? 0}</strong>
                    {t.home.scans7d}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}
