import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CreateMenuForm } from "@/components/MenuForms";
import { AppHeader } from "@/components/SiteChrome";
import { DASHBOARD } from "@/content/dashboard";
import { MENU } from "@/content/menu";
import { isLocale } from "@/lib/i18n";
import { requireAccount } from "@/lib/dynamic/account";
import { PLAN_LIMITS } from "@/lib/dynamic/plans";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata({ params }: PageProps<"/[lang]/dashboard/menus">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return { title: MENU[lang].metaTitle, robots: { index: false } };
}

export default async function MenusPage({ params }: PageProps<"/[lang]/dashboard/menus">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = MENU[lang];
  const errors = { ...DASHBOARD[lang].errors, ...t.errors };
  const account = await requireAccount(lang);
  const supabase = await createClient();

  const [{ data: menus }, { count: codeCount }] = await Promise.all([
    supabase.from("menus").select("id, title, mode, created_at").eq("workspace_id", account.workspaceId).order("created_at", { ascending: false }),
    supabase.from("qr_codes").select("id", { count: "exact", head: true }).eq("workspace_id", account.workspaceId),
  ]);
  const limits = PLAN_LIMITS[account.plan];
  const atMenuLimit = (menus?.length ?? 0) >= limits.menus;
  const atCodeLimit = (codeCount ?? 0) >= limits.dynamicCodes;
  const prefix = lang === "fr" ? "/fr" : "";

  return (
    <>
      <AppHeader locale={lang} path="/dashboard/menus" signedIn />
      <main id="main" className="mx-auto w-full max-w-4xl flex-1 space-y-8 px-4 py-8">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-stone-900">{t.h1}</h1>
          <p className="text-stone-600">{t.intro}</p>
        </div>

        {menus && menus.length > 0 ? (
          <ul className="divide-y divide-stone-200 rounded-2xl border border-stone-200 bg-white">
            {menus.map((menu) => (
              <li key={menu.id}>
                <Link href={`${prefix}/dashboard/menus/${menu.id}`} className="flex items-center justify-between gap-4 p-4 hover:bg-stone-50">
                  <span>
                    <span className="block font-medium text-stone-900">{menu.title}</span>
                    <span className="block text-sm text-stone-500">{menu.mode === "builder" ? t.list.builder : t.list.file}</span>
                  </span>
                  <span className="text-sm text-brand-700">{t.list.open} →</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-stone-600">{t.list.empty}</p>
        )}

        {atMenuLimit ? (
          <p className="text-sm text-stone-600">{t.errors.menuLimit}</p>
        ) : atCodeLimit ? (
          <p className="text-sm text-stone-600">{errors.limit}</p>
        ) : (
          <CreateMenuForm locale={lang} t={t} errors={errors} />
        )}
      </main>
    </>
  );
}
