import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CreateCodeForm } from "@/components/DashboardForms";
import { AppHeader } from "@/components/SiteChrome";
import { DASHBOARD } from "@/content/dashboard";
import { isLocale } from "@/lib/i18n";
import { requireAccount } from "@/lib/dynamic/account";
import { PLAN_LIMITS } from "@/lib/dynamic/plans";
import { shortUrl } from "@/lib/dynamic/slug";
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
      <main id="main" className="mx-auto w-full max-w-6xl flex-1 space-y-8 px-4 py-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-stone-900">{t.home.h1}</h1>
            <p className="text-sm text-stone-600">
              {t.home.plan[account.plan]} · {t.home.usage(used, limit)}
            </p>
          </div>
        </div>
        <p className="rounded-xl border border-brand-600/30 bg-brand-50 px-4 py-3 text-sm text-brand-800">{t.home.promise}</p>

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
        {used >= limit && <p className="text-sm text-stone-600">{t.home.limitReached}</p>}

        {used === 0 ? (
          <p className="text-stone-600">{t.home.empty}</p>
        ) : (
          <ul className="divide-y divide-stone-200 rounded-2xl border border-stone-200 bg-white">
            {codes!.map((code) => (
              <li key={code.id}>
                <Link
                  href={`${prefix}/dashboard/codes/${code.id}`}
                  className="grid gap-1 p-4 hover:bg-stone-50 sm:grid-cols-[1fr_auto] sm:items-center"
                >
                  <span className="min-w-0">
                    <span className="block font-medium text-stone-900">
                      {code.name || code.short_slug}
                      {!code.is_active && (
                        <span className="ml-2 rounded-full bg-stone-200 px-2 py-0.5 text-xs text-stone-700">{t.home.archived}</span>
                      )}
                    </span>
                    <span className="block truncate text-sm text-stone-500">
                      {shortUrl(code.short_slug)} → {code.destination_url}
                    </span>
                  </span>
                  <span className="text-sm text-stone-600">
                    {t.home.scans7d}: <strong>{scansByCode.get(code.id) ?? 0}</strong>
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
