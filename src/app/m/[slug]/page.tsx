import type { Metadata } from "next";
import { unstable_cache } from "next/cache";
import { notFound } from "next/navigation";
import { cache } from "react";
import { MENU_PUBLIC } from "@/content/menu";
import { SLUG_PATTERN } from "@/lib/dynamic/slug";
import {
  DAYS,
  hasHours,
  isMenuLang,
  menuTag,
  parseHours,
  pick,
  publicFileUrl,
  rtl,
  type MenuLang,
  type MenuSection,
  type OpeningHours,
} from "@/lib/menu/menu";
import { normalizeColor } from "@/lib/review/kit";
import { createAdminClient } from "@/lib/supabase/admin";
import { SUPABASE_URL } from "@/lib/supabase/env";

type PublicMenu = {
  title: string;
  mode: "file" | "builder";
  languages: MenuLang[];
  sections: MenuSection[];
  hours: OpeningHours;
  phone: string | null;
  whatsapp: string | null;
  fileUrl: string | null;
  fileType: "pdf" | "image" | null;
  color: string;
};

// Cached like the redirect: edits clear the tag, and if the database is down
// the last good copy keeps being served.
const fetchMenu = (slug: string) =>
  unstable_cache(
    async (): Promise<PublicMenu | null> => {
      const { data, error } = await createAdminClient()
        .from("qr_codes")
        .select("is_active, menus(title, mode, languages, sections, opening_hours, phone, whatsapp, file_path, file_type, theme)")
        .eq("short_slug", slug)
        .eq("type", "menu")
        .maybeSingle();
      if (error) throw error;
      const menu = (data?.menus as unknown as Record<string, unknown>[] | null)?.[0];
      if (!data?.is_active || !menu) return null;
      const languages = (menu.languages as string[]).filter(isMenuLang);
      return {
        title: menu.title as string,
        mode: menu.mode === "builder" ? "builder" : "file",
        languages: languages.length > 0 ? languages : ["en"],
        sections: (menu.sections ?? []) as MenuSection[],
        hours: parseHours(menu.opening_hours),
        phone: (menu.phone as string | null) ?? null,
        whatsapp: (menu.whatsapp as string | null) ?? null,
        fileUrl: menu.file_path ? publicFileUrl(SUPABASE_URL, menu.file_path as string) : null,
        fileType: (menu.file_type as "pdf" | "image" | null) ?? null,
        color: normalizeColor((menu.theme as { color?: string } | null)?.color),
      };
    },
    ["public-menu", slug],
    { tags: [menuTag(slug)], revalidate: 300 },
  )();

const loadMenu = cache(async (slug: string) => (SLUG_PATTERN.test(slug) ? fetchMenu(slug) : null));

function chooseLang(menu: PublicMenu, requested: unknown): MenuLang {
  return isMenuLang(requested) && menu.languages.includes(requested) ? requested : menu.languages[0];
}

export async function generateMetadata({ params }: PageProps<"/m/[slug]">): Promise<Metadata> {
  const menu = await loadMenu((await params).slug);
  return menu ? { title: menu.title } : {};
}

export default async function PublicMenuPage({ params, searchParams }: PageProps<"/m/[slug]">) {
  const { slug } = await params;
  const menu = await loadMenu(slug);
  if (!menu) notFound();
  const lang = chooseLang(menu, (await searchParams).lang);
  const fallback = menu.languages[0];
  const t = MENU_PUBLIC[lang];
  const sections = menu.sections.filter((s) => s.items.length > 0 || pick(s.title, lang, fallback));
  const showFile = menu.mode === "file" && menu.fileUrl;
  const showSections = menu.mode === "builder" && sections.length > 0;
  const list = new Intl.ListFormat(lang, { type: "unit", style: "short" });

  return (
    <main lang={lang} dir={rtl(lang) ? "rtl" : "ltr"} className="mx-auto min-h-screen max-w-xl pb-12">
      <header className="space-y-4 px-4 pb-6 pt-8 text-white" style={{ backgroundColor: menu.color }}>
        <h1 className="text-2xl font-bold">{menu.title}</h1>
        {menu.languages.length > 1 && (
          <nav aria-label={t.language} className="flex flex-wrap gap-2">
            {menu.languages.map((l) => (
              <a
                key={l}
                href={`?lang=${l}`}
                hrefLang={l}
                lang={l}
                aria-current={l === lang ? "true" : undefined}
                className={`rounded-full border border-white/60 px-3 py-1 text-sm ${l === lang ? "bg-white text-stone-900" : "text-white"}`}
              >
                {LANG_LABELS[l]}
              </a>
            ))}
          </nav>
        )}
        {(menu.phone || menu.whatsapp) && (
          <div className="flex gap-3">
            {menu.phone && (
              <a href={`tel:${menu.phone}`} className="flex-1 rounded-xl bg-white px-4 py-3 text-center font-semibold text-stone-900">
                {t.call}
              </a>
            )}
            {menu.whatsapp && (
              <a href={`https://wa.me/${menu.whatsapp}`} rel="noopener" className="flex-1 rounded-xl bg-white px-4 py-3 text-center font-semibold text-stone-900">
                {t.whatsapp}
              </a>
            )}
          </div>
        )}
      </header>

      <div className="space-y-8 px-4 pt-6">
        {showFile && menu.fileType === "image" && (
          <a href={menu.fileUrl!} rel="noopener" className="block">
            {/* eslint-disable-next-line @next/next/no-img-element -- restaurant's own upload from Storage */}
            <img src={menu.fileUrl!} alt={menu.title} className="w-full rounded-xl border border-stone-200 bg-white" />
          </a>
        )}
        {showFile && menu.fileType === "pdf" && (
          <a
            href={menu.fileUrl!}
            rel="noopener"
            className="block rounded-xl px-5 py-4 text-center text-lg font-semibold text-white shadow-sm"
            style={{ backgroundColor: menu.color }}
          >
            {t.openFile}
          </a>
        )}

        {showSections &&
          sections.map((section) => (
            <section key={section.id} className="space-y-3">
              {pick(section.title, lang, fallback) && (
                <h2 className="border-b-2 pb-1 text-lg font-bold text-stone-900" style={{ borderColor: menu.color }}>
                  {pick(section.title, lang, fallback)}
                </h2>
              )}
              <ul className="divide-y divide-stone-200">
                {section.items.map((item) => (
                  <li key={item.id} className="flex gap-3 py-3">
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-baseline justify-between gap-3">
                        <h3 className="font-semibold text-stone-900">{pick(item.name, lang, fallback)}</h3>
                        {item.price && (
                          <span dir="ltr" className="shrink-0 font-semibold text-stone-900">
                            {item.price}
                          </span>
                        )}
                      </div>
                      {pick(item.description, lang, fallback) && <p className="text-sm text-stone-600">{pick(item.description, lang, fallback)}</p>}
                      {item.allergens.length > 0 && (
                        <p className="text-xs text-stone-500">
                          {t.allergens}: {list.format(item.allergens.map((a) => t.allergenNames[a]))}
                        </p>
                      )}
                    </div>
                    {item.photo && (
                      /* eslint-disable-next-line @next/next/no-img-element -- restaurant's own upload from Storage */
                      <img src={publicFileUrl(SUPABASE_URL, item.photo)} alt="" loading="lazy" className="h-20 w-20 shrink-0 rounded-lg object-cover" />
                    )}
                  </li>
                ))}
              </ul>
            </section>
          ))}

        {!showFile && !showSections && <p className="rounded-xl bg-white p-4 text-center text-stone-600">{t.empty}</p>}

        {hasHours(menu.hours) && (
          <section className="space-y-2 rounded-xl bg-white p-4">
            <h2 className="font-semibold text-stone-900">{t.hours}</h2>
            <dl className="space-y-1 text-sm">
              {DAYS.filter((day) => day in menu.hours).map((day) => {
                const hours = menu.hours[day];
                return (
                  <div key={day} className="flex justify-between gap-4">
                    <dt className="text-stone-600">{t.days[day]}</dt>
                    <dd dir="ltr" className="font-medium text-stone-900">
                      {hours ? `${hours.open} – ${hours.close}` : t.closed}
                    </dd>
                  </div>
                );
              })}
            </dl>
          </section>
        )}
      </div>
    </main>
  );
}

const LANG_LABELS: Record<MenuLang, string> = { en: "English", fr: "Français", ar: "العربية", es: "Español" };
