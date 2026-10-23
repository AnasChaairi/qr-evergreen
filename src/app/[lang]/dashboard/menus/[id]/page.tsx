import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { setMenuMode } from "@/app/[lang]/dashboard/menus/actions";
import { ShortLinkDownload } from "@/components/DashboardForms";
import { MenuBuilder, MenuDetailsForm, MenuFileUpload, MenuPackPanel } from "@/components/MenuForms";
import { AppHeader } from "@/components/SiteChrome";
import { DASHBOARD } from "@/content/dashboard";
import { MENU } from "@/content/menu";
import { REVIEW } from "@/content/review";
import { SITE_URL, isLocale } from "@/lib/i18n";
import { requireAccount } from "@/lib/dynamic/account";
import { PLAN_LIMITS } from "@/lib/dynamic/plans";
import { shortUrl } from "@/lib/dynamic/slug";
import { parseHours, type MenuLang, type MenuSection } from "@/lib/menu/menu";
import { designsForPlan, normalizeColor } from "@/lib/review/kit";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata({ params }: PageProps<"/[lang]/dashboard/menus/[id]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return { title: MENU[lang].metaTitle, robots: { index: false } };
}

export default async function MenuPage({ params }: PageProps<"/[lang]/dashboard/menus/[id]">) {
  const { lang, id } = await params;
  if (!isLocale(lang)) notFound();
  const t = MENU[lang];
  const errors = { ...DASHBOARD[lang].errors, ...t.errors };
  const account = await requireAccount(lang);
  const supabase = await createClient();

  const { data: menu } = await supabase
    .from("menus")
    .select("id, title, mode, languages, sections, theme, opening_hours, phone, whatsapp, file_path, qr_code_id, qr_codes(short_slug)")
    .eq("id", id)
    .maybeSingle();
  if (!menu || !menu.qr_code_id) notFound();
  const slug = (menu.qr_codes as unknown as { short_slug: string }).short_slug;
  const limits = PLAN_LIMITS[account.plan];
  const color = normalizeColor((menu.theme as { color?: string } | null)?.color);
  const languages = menu.languages as MenuLang[];
  const prefix = lang === "fr" ? "/fr" : "";
  const link = shortUrl(slug);
  const pageUrl = `${SITE_URL}/m/${slug}`;

  return (
    <>
      <AppHeader locale={lang} path={`/dashboard/menus/${menu.id}`} signedIn />
      <main id="main" className="mx-auto w-full max-w-4xl flex-1 space-y-8 px-4 py-8">
        <Link href={`${prefix}/dashboard/menus`} className="text-sm text-brand-700 underline">
          ← {t.edit.back}
        </Link>
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-stone-900">{menu.title}</h1>
          <p className="text-sm text-stone-600">
            {t.edit.shortLink}: <span className="font-mono">{link}</span>
          </p>
          <p className="text-sm text-stone-600">
            {t.edit.publicPage}:{" "}
            <a href={pageUrl} target="_blank" rel="noopener" className="text-brand-700 underline">
              {pageUrl}
            </a>
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-[1fr_auto]">
          <section className="rounded-2xl border border-stone-200 bg-white p-4 sm:p-6">
            <MenuPackPanel title={menu.title} shortUrl={link} color={color} allowed={designsForPlan(account.plan)} t={t} designNames={REVIEW[lang].kit.designs} />
          </section>
          <section className="rounded-2xl border border-stone-200 bg-white p-4 sm:p-6">
            <ShortLinkDownload url={link} slug={slug} label={t.edit.download} />
          </section>
        </div>

        <section className="space-y-3 rounded-2xl border border-stone-200 bg-white p-4 sm:p-6">
          <h2 className="font-semibold text-stone-900">{t.mode.heading}</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {(["file", "builder"] as const).map((mode) => {
              const locked = mode === "builder" && !limits.menuBuilder && menu.mode !== "builder";
              const active = menu.mode === mode;
              return (
                <form key={mode} action={setMenuMode}>
                  <input type="hidden" name="locale" value={lang} />
                  <input type="hidden" name="id" value={menu.id} />
                  <input type="hidden" name="mode" value={mode} />
                  <button
                    type="submit"
                    disabled={locked || active}
                    aria-pressed={active}
                    className={`h-full w-full rounded-xl border p-4 text-start ${
                      active ? "border-brand-700 bg-brand-50" : "border-stone-300 hover:bg-stone-50"
                    } ${locked ? "cursor-not-allowed opacity-50" : ""}`}
                  >
                    <span className="block font-medium text-stone-900">
                      {t.mode[mode]} {locked && <span className="text-xs font-normal">({t.mode.locked})</span>}
                    </span>
                    <span className="block text-sm text-stone-600">{mode === "file" ? t.mode.fileHelp : t.mode.builderHelp}</span>
                  </button>
                </form>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-stone-200 bg-white p-4 sm:p-6">
          {menu.mode === "builder" ? (
            <>
              {!limits.menuBuilder && <p className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">{t.edit.builderLocked}</p>}
              <MenuBuilder
                locale={lang}
                id={menu.id}
                t={t}
                errors={errors}
                languages={languages}
                initial={(menu.sections ?? []) as MenuSection[]}
                locked={!limits.menuBuilder}
              />
            </>
          ) : (
            <MenuFileUpload locale={lang} id={menu.id} t={t} errors={errors} currentPath={menu.file_path} />
          )}
        </section>

        <section className="space-y-4 rounded-2xl border border-stone-200 bg-white p-4 sm:p-6">
          <h2 className="font-semibold text-stone-900">{t.edit.settings}</h2>
          <MenuDetailsForm
            locale={lang}
            id={menu.id}
            t={t}
            errors={errors}
            title={menu.title}
            languages={languages}
            maxLanguages={limits.menuLanguages}
            color={color}
            phone={menu.phone ?? ""}
            whatsapp={menu.whatsapp ?? ""}
            hours={parseHours(menu.opening_hours)}
          />
        </section>
      </main>
    </>
  );
}
