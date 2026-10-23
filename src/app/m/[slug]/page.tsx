import type { Metadata } from "next";
import { unstable_cache } from "next/cache";
import { notFound } from "next/navigation";
import { cache } from "react";
import { ChatIcon, ClockIcon, FileIcon, PhoneIcon } from "@/components/Icons";
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
    <main lang={lang} dir={rtl(lang) ? "rtl" : "ltr"} className="mx-auto min-h-screen max-w-xl bg-stone-50 pb-12">
      <header className="space-y-5 rounded-b-[28px] px-5 pb-6 pt-8 text-white" style={{ backgroundColor: menu.color }}>
        {menu.languages.length > 1 && (
          <nav aria-label={t.language} className="flex w-fit flex-wrap gap-1 rounded-full bg-black/15 p-1">
            {menu.languages.map((l) => (
              <a
                key={l}
                href={`?lang=${l}`}
                hrefLang={l}
                lang={l}
                aria-current={l === lang ? "true" : undefined}
                className={`inline-flex min-h-10 items-center rounded-full px-4 text-sm font-semibold ${l === lang ? "bg-white text-stone-900" : "text-white hover:bg-white/15"}`}
              >
                {LANG_LABELS[l]}
              </a>
            ))}
          </nav>
        )}
        <h1 className="text-3xl font-extrabold leading-tight">{menu.title}</h1>
        {(menu.phone || menu.whatsapp) && (
          <div className="flex gap-3">
            {menu.phone && (
              <a href={`tel:${menu.phone}`} className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-white px-4 font-bold text-stone-900">
                <PhoneIcon className="h-5 w-5" />
                {t.call}
              </a>
            )}
            {menu.whatsapp && (
              <a
                href={`https://wa.me/${menu.whatsapp}`}
                rel="noopener"
                className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-[#25d366] px-4 font-bold text-[#0b2e17]"
              >
                <ChatIcon className="h-5 w-5" />
                {t.whatsapp}
              </a>
            )}
          </div>
        )}
      </header>

      {showSections && sections.length > 1 && (
        <nav aria-label={menu.title} className="sticky top-0 z-10 flex gap-2 overflow-x-auto border-b border-stone-200 bg-white/95 px-5 py-3 backdrop-blur">
          {sections.map((section) =>
            pick(section.title, lang, fallback) ? (
              <a
                key={section.id}
                href={`#s-${section.id}`}
                className="inline-flex min-h-10 shrink-0 items-center rounded-full bg-stone-100 px-4 text-sm font-semibold text-stone-800 hover:bg-stone-200"
              >
                {pick(section.title, lang, fallback)}
              </a>
            ) : null,
          )}
        </nav>
      )}

      <div className="space-y-8 px-5 pt-6">
        {showFile && menu.fileType === "image" && (
          <a href={menu.fileUrl!} rel="noopener" className="block">
            {/* eslint-disable-next-line @next/next/no-img-element -- restaurant's own upload from Storage */}
            <img src={menu.fileUrl!} alt={menu.title} className="w-full rounded-3xl border border-stone-200 bg-white shadow-soft" />
          </a>
        )}
        {showFile && menu.fileType === "pdf" && (
          <a
            href={menu.fileUrl!}
            rel="noopener"
            className="flex min-h-16 items-center justify-center gap-2 rounded-2xl px-5 text-center text-lg font-bold text-white shadow-soft"
            style={{ backgroundColor: menu.color }}
          >
            <FileIcon className="h-6 w-6" />
            {t.openFile}
          </a>
        )}

        {showSections &&
          sections.map((section) => (
            <section key={section.id} id={`s-${section.id}`} className="scroll-mt-20 space-y-3">
              {pick(section.title, lang, fallback) && (
                <h2 className="flex items-center gap-3 text-2xl font-bold text-stone-900">
                  <span aria-hidden="true" className="h-6 w-1.5 rounded-full" style={{ backgroundColor: menu.color }} />
                  {pick(section.title, lang, fallback)}
                </h2>
              )}
              <ul className="space-y-3">
                {section.items.map((item) => (
                  <li key={item.id} className="flex gap-4 rounded-2xl bg-white p-4 shadow-[0_1px_2px_rgb(18_38_29/0.06)]">
                    {item.photo && (
                      /* eslint-disable-next-line @next/next/no-img-element -- restaurant's own upload from Storage */
                      <img src={publicFileUrl(SUPABASE_URL, item.photo)} alt="" loading="lazy" className="h-20 w-20 shrink-0 rounded-xl object-cover" />
                    )}
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-baseline justify-between gap-3">
                        <h3 className="font-sans text-[17px] font-bold tracking-normal text-stone-900">{pick(item.name, lang, fallback)}</h3>
                        {item.price && (
                          <span dir="ltr" className="shrink-0 font-bold" style={{ color: menu.color }}>
                            {item.price}
                          </span>
                        )}
                      </div>
                      {pick(item.description, lang, fallback) && (
                        <p className="text-[15px] leading-snug text-stone-600">{pick(item.description, lang, fallback)}</p>
                      )}
                      {item.allergens.length > 0 && (
                        <p className="text-[13px] text-stone-500">
                          {t.allergens}: {list.format(item.allergens.map((a) => t.allergenNames[a]))}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}

        {!showFile && !showSections && <p className="rounded-2xl bg-white p-6 text-center text-stone-600">{t.empty}</p>}

        {hasHours(menu.hours) && (
          <section className="space-y-3 rounded-3xl bg-white p-5">
            <h2 className="flex items-center gap-2 text-xl font-bold text-stone-900">
              <ClockIcon className="h-5 w-5 text-stone-500" />
              {t.hours}
            </h2>
            <dl className="space-y-2 text-[15px]">
              {DAYS.filter((day) => day in menu.hours).map((day) => {
                const hours = menu.hours[day];
                return (
                  <div key={day} className="flex justify-between gap-4">
                    <dt className="text-stone-600">{t.days[day]}</dt>
                    <dd dir="ltr" className="font-semibold text-stone-900">
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
