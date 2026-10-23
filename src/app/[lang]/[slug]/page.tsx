import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdSlot } from "@/components/AdSlot";
import { FaqList, Sections, ToolCard } from "@/components/Content";
import { Generator } from "@/components/Generator";
import { Header } from "@/components/SiteChrome";
import { HOME, INFO_PAGES } from "@/content/pages";
import { TOOLS } from "@/content/tools";
import { UI } from "@/content/ui";
import { LOCALES, SLUGS, alternatesFor, isLocale, pageIdFromSlug, pathFor, type Locale } from "@/lib/i18n";
import { CODE_TYPES, type CodeType } from "@/lib/qr/payloads";

export const dynamicParams = false;

export function generateStaticParams() {
  return LOCALES.flatMap((lang) => Object.values(SLUGS).map((slugs) => ({ lang, slug: slugs[lang] })));
}

function isCodeType(page: string): page is CodeType {
  return (CODE_TYPES as string[]).includes(page);
}

async function resolve(params: PageProps<"/[lang]/[slug]">["params"]) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) return null;
  const page = pageIdFromSlug(lang, slug);
  return page ? { lang, page } : null;
}

export async function generateMetadata({ params }: PageProps<"/[lang]/[slug]">): Promise<Metadata> {
  const resolved = await resolve(params);
  if (!resolved) return {};
  const { lang, page } = resolved;
  const content = isCodeType(page) ? TOOLS[lang][page] : INFO_PAGES[lang][page];
  return {
    title: content.metaTitle,
    description: content.metaDescription,
    alternates: alternatesFor(lang, page),
    openGraph: {
      title: content.metaTitle,
      description: content.metaDescription,
      url: pathFor(lang, page),
      siteName: "QR Evergreen",
      locale: lang,
      type: "website",
    },
  };
}

export default async function SlugPage({ params }: PageProps<"/[lang]/[slug]">) {
  const resolved = await resolve(params);
  if (!resolved) notFound();
  const { lang, page } = resolved;
  return isCodeType(page) ? <ToolPage lang={lang} type={page} /> : <InfoPage lang={lang} page={page} />;
}

// Related tools: every other MVP type, in a stable order.
function relatedTo(type: CodeType): CodeType[] {
  return CODE_TYPES.filter((t) => t !== type);
}

function ToolPage({ lang, type }: { lang: Locale; type: CodeType }) {
  const tool = TOOLS[lang][type];
  const ui = UI[lang];
  return (
    <>
      <Header locale={lang} page={type} />
      <main id="main" className="mx-auto w-full max-w-6xl flex-1 space-y-10 px-4 py-8 sm:py-12">
        <section className="space-y-6">
          <div className="max-w-3xl space-y-3">
            <h1 className="text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">{tool.h1}</h1>
            <p className="text-lg leading-relaxed text-stone-600">{tool.intro}</p>
          </div>
          <Generator t={ui.generator} initialType={type} />
          <p className="rounded-xl border border-brand-600/30 bg-brand-50 px-4 py-3 text-sm text-brand-800">
            {tool.upsell}
          </p>
          <AdSlot placement="belowGenerator" />
        </section>

        <div className="grid gap-10 lg:grid-cols-[1fr_300px]">
          <article className="max-w-3xl space-y-10">
            <Sections sections={tool.sections.slice(0, 2)} />
            <AdSlot placement="inContent" />
            <Sections sections={tool.sections.slice(2)} />
            <FaqList heading={ui.faqHeading} items={tool.faq} />
          </article>
          <aside className="space-y-4">
            <h2 className="text-lg font-semibold text-stone-900">{ui.relatedTools}</h2>
            <div className="space-y-3">
              {relatedTo(type).map((related) => (
                <ToolCard
                  key={related}
                  href={pathFor(lang, related)}
                  title={TOOLS[lang][related].h1}
                  blurb={HOME[lang].toolBlurbs[related]}
                />
              ))}
            </div>
            <AdSlot placement="sidebar" className="hidden lg:block" />
          </aside>
        </div>
      </main>
    </>
  );
}

function InfoPage({ lang, page }: { lang: Locale; page: "privacy" | "terms" | "about" | "contact" }) {
  const content = INFO_PAGES[lang][page];
  return (
    <>
      <Header locale={lang} page={page} />
      <main id="main" className="mx-auto w-full max-w-3xl flex-1 space-y-8 px-4 py-8 sm:py-12">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-stone-900">{content.h1}</h1>
          {content.updated && <p className="text-sm text-stone-500">{content.updated}</p>}
        </div>
        <Sections sections={content.sections} />
        <p>
          <Link href={pathFor(lang, "home")} className="font-medium text-brand-700 underline">
            {UI[lang].tagline}
          </Link>
        </p>
      </main>
    </>
  );
}
