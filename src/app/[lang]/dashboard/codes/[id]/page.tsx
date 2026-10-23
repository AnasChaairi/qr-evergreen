import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { setArchived } from "@/app/[lang]/dashboard/actions";
import { DestinationForm, ShortLinkDownload } from "@/components/DashboardForms";
import { AppHeader } from "@/components/SiteChrome";
import { DASHBOARD } from "@/content/dashboard";
import { isLocale } from "@/lib/i18n";
import { requireAccount } from "@/lib/dynamic/account";
import { PLAN_LIMITS } from "@/lib/dynamic/plans";
import { shortUrl } from "@/lib/dynamic/slug";
import { daysAgo, lastDays } from "@/lib/dynamic/time";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata({ params }: PageProps<"/[lang]/dashboard/codes/[id]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return { title: DASHBOARD[lang].home.metaTitle, robots: { index: false } };
}

// Chart window: 30 days. Days beyond the plan's history are shown blurred.
const CHART_DAYS = 30;

export default async function CodePage({ params }: PageProps<"/[lang]/dashboard/codes/[id]">) {
  const { lang, id } = await params;
  if (!isLocale(lang)) notFound();
  const t = DASHBOARD[lang];
  const account = await requireAccount(lang);
  const supabase = await createClient();

  const { data: code } = await supabase
    .from("qr_codes")
    .select("id, name, short_slug, destination_url, is_active")
    .eq("id", id)
    .maybeSingle();
  if (!code) notFound();

  const historyDays = PLAN_LIMITS[account.plan].analyticsDays;
  const visibleDays = historyDays === null ? CHART_DAYS : Math.min(historyDays, CHART_DAYS);
  const since = daysAgo(CHART_DAYS);
  const visibleSince = daysAgo(visibleDays);

  const [{ data: daily }, { data: recent }] = await Promise.all([
    supabase.rpc("scan_daily_counts", { code_ids: [code.id], since: since.toISOString() }),
    supabase
      .from("scans")
      .select("country, device")
      .eq("qr_code_id", code.id)
      .gte("scanned_at", visibleSince.toISOString())
      .limit(5000),
  ]);

  const byDay = new Map<string, { scans: number; unique: number }>();
  for (const row of (daily ?? []) as { day: string; scans: number; unique_scans: number }[]) {
    byDay.set(row.day, { scans: Number(row.scans), unique: Number(row.unique_scans) });
  }
  const days = lastDays(CHART_DAYS).map((date, i) => ({
    date,
    ...(byDay.get(date) ?? { scans: 0, unique: 0 }),
    locked: i < CHART_DAYS - visibleDays,
  }));
  const visible = days.filter((d) => !d.locked);
  const total = visible.reduce((sum, d) => sum + d.scans, 0);
  const unique = visible.reduce((sum, d) => sum + d.unique, 0);
  const max = Math.max(1, ...days.map((d) => d.scans));

  const countries = topCounts((recent ?? []).map((r) => r.country ?? "—"));
  const devices = topCounts((recent ?? []).map((r) => r.device ?? "other"));
  const prefix = lang === "fr" ? "/fr" : "";
  const link = shortUrl(code.short_slug);

  return (
    <>
      <AppHeader locale={lang} path={`/dashboard/codes/${code.id}`} signedIn />
      <main id="main" className="mx-auto w-full max-w-6xl flex-1 space-y-8 px-4 py-10 sm:px-6">
        <Link href={`${prefix}/dashboard`} className="btn-link text-[15px]">
          ← {t.code.back}
        </Link>
        <div className="space-y-1">
          <h1 className="page-title">{code.name || code.short_slug}</h1>
          <p className="text-[15px] text-stone-600">
            {t.code.shortLink}: <span className="break-all font-mono">{link}</span>
          </p>
        </div>

        {!code.is_active && (
          <p className="notice-warn">{t.code.archivedNote}</p>
        )}

        <div className="grid gap-8 lg:grid-cols-[1fr_260px]">
          <section className="space-y-6 card">
            <DestinationForm locale={lang} id={code.id} destination={code.destination_url}
              t={{ destination: t.code.destination, save: t.code.save, saved: t.code.saved }}
              errors={t.errors}
            />
            <form action={setArchived}>
              <input type="hidden" name="locale" value={lang} />
              <input type="hidden" name="id" value={code.id} />
              <input type="hidden" name="archived" value={code.is_active ? "true" : "false"} />
              <button type="submit" className="inline-flex min-h-11 items-center text-[15px] text-stone-600 underline underline-offset-4 hover:text-stone-900">
                {code.is_active ? t.code.archive : t.code.restore}
              </button>
            </form>
          </section>
          <ShortLinkDownload url={link} slug={code.short_slug} label={t.code.download} />
        </div>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-stone-900">{t.code.analytics}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Stat label={t.code.total} value={total} />
            <Stat label={t.code.unique} value={unique} />
          </div>
          <div className="rounded-3xl border border-stone-200 bg-white p-6">
            <div className="flex h-40 items-end gap-1" role="img" aria-label={`${t.code.total}: ${total}`}>
              {days.map((d) => (
                <div
                  key={d.date}
                  title={d.locked ? undefined : `${d.date}: ${d.scans}`}
                  className={`flex-1 rounded-t bg-brand-600 ${d.locked ? "opacity-30 blur-[2px]" : ""}`}
                  style={{ height: `${d.locked ? 40 : Math.max(2, (d.scans / max) * 100)}%` }}
                />
              ))}
            </div>
            {historyDays !== null && historyDays < CHART_DAYS && (
              <p className="mt-3 text-sm text-stone-600">{t.code.lockedHistory(historyDays)}</p>
            )}
          </div>
          {total === 0 ? (
            <p className="text-[17px] text-stone-600">{t.code.noScans}</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <Breakdown title={t.code.countries} rows={countries} />
              <Breakdown title={t.code.devices} rows={devices} />
            </div>
          )}
        </section>
      </main>
    </>
  );
}

function topCounts(values: string[], limit = 5): [string, number][] {
  const counts = new Map<string, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit);
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-3xl border border-stone-200 bg-white p-6">
      <p className="text-[15px] text-stone-600">{label}</p>
      <p className="font-display text-4xl font-extrabold text-stone-900">{value}</p>
    </div>
  );
}

function Breakdown({ title, rows }: { title: string; rows: [string, number][] }) {
  return (
    <div className="rounded-3xl border border-stone-200 bg-white p-6">
      <h3 className="mb-3 text-lg font-bold text-stone-900">{title}</h3>
      <ul className="space-y-1 text-sm">
        {rows.map(([name, count]) => (
          <li key={name} className="flex justify-between text-stone-700">
            <span>{name}</span>
            <span className="font-medium">{count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
