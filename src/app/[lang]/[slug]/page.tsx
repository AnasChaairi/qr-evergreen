import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdSlot } from "@/components/AdSlot";
import { FaqList, Sections, ToolCard } from "@/components/Content";
import { Generator } from "@/components/Generator";
import { InfinityIcon, TYPE_ICONS } from "@/components/Icons";
import { PricingPromise, PricingTable } from "@/components/Pricing";
import { Header } from "@/components/SiteChrome";
import { BILLING } from "@/content/billing";
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
  const content = isCodeType(page) ? TOOLS[lang][page] : page === "pricing" ? BILLING[lang].pricing : INFO_PAGES[lang][page];
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
  if (isCodeType(page)) return <ToolPage lang={lang} type={page} />;
  return page === "pricing" ? <PricingPage lang={lang} /> : <InfoPage lang={lang} page={page} />;
}

// Related tools: every other MVP type, in a stable order.
function relatedTo(type: CodeType): CodeType[] {
  return CODE_TYPES.filter((t) => t !== type);
}

function ToolPage({ lang, type }: { lang: Locale; type: CodeType }) {
  const tool = TOOLS[lang][type];
  const ui = UI[lang];
  const Icon = TYPE_ICONS[type];
  return (
    <>
      <Header locale={lang} page={type} />
      <main id="main" className="mx-auto w-full max-w-6xl flex-1 space-y-12 px-4 pt-10 sm:px-6 sm:pt-14">
        <section className="space-y-8">
          <div className="max-w-3xl space-y-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-700 text-white">
              <Icon className="h-7 w-7" />
            </span>
            <h1 className="text-4xl font-extrabold leading-[1.05] text-stone-900 sm:text-5xl">{tool.h1}</h1>
            <p className="text-lg leading-relaxed text-stone-600 sm:text-xl">{tool.intro}</p>
          </div>
          <Generator t={ui.generator} initialType={type} />
          <p className="notice flex gap-3">
            <InfinityIcon className="mt-0.5 h-5 w-5 shrink-0 text-brand-700" />
            {tool.upsell}
          </p>
          <AdSlot placement="belowGenerator" />
        </section>

        <div className="grid gap-12 lg:grid-cols-[1fr_320px]">
          <article className="max-w-3xl space-y-12">
            <Sections sections={tool.sections.slice(0, 2)} />
            <AdSlot placement="inContent" />
            <Sections sections={tool.sections.slice(2)} />
            <FaqList heading={ui.faqHeading} items={tool.faq} />
          </article>
          <aside className="space-y-4">
            <h2 className="text-xl font-bold text-stone-900">{ui.relatedTools}</h2>
            <div className="space-y-3">
              {relatedTo(type).map((related) => {
                const RelatedIcon = TYPE_ICONS[related];
                return (
                  <ToolCard
                    key={related}
                    href={pathFor(lang, related)}
                    title={TOOLS[lang][related].h1}
                    blurb={HOME[lang].toolBlurbs[related]}
                    icon={<RelatedIcon />}
                  />
                );
              })}
            </div>
            <AdSlot placement="sidebar" className="hidden lg:block" />
          </aside>
        </div>
      </main>
    </>
  );
}

function PricingPage({ lang }: { lang: Locale }) {
  const t = BILLING[lang].pricing;
  return (
    <>
      <Header locale={lang} page="pricing" />
      <main id="main" className="mx-auto w-full max-w-6xl flex-1 space-y-12 px-4 pt-12 sm:px-6 sm:pt-16">
        <div className="mx-auto max-w-3xl space-y-4 text-center">
          <h1 className="text-4xl font-extrabold leading-[1.05] text-stone-900 sm:text-5xl">{t.h1}</h1>
          <p className="text-lg leading-relaxed text-stone-600 sm:text-xl">{t.intro}</p>
        </div>
        <PricingTable locale={lang} />
        <PricingPromise locale={lang} />
        <div className="mx-auto max-w-3xl">
          <FaqList heading={t.faqHeading} items={t.faq} />
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
      <main id="main" className="mx-auto w-full max-w-3xl flex-1 space-y-10 px-4 pt-12 sm:px-6 sm:pt-16">
        <div className="space-y-3">
          <h1 className="text-4xl font-extrabold text-stone-900 sm:text-5xl">{content.h1}</h1>
          {content.updated && <p className="chip bg-stone-100 text-stone-600">{content.updated}</p>}
        </div>
        <div className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-10">
          <Sections sections={content.sections} />
        </div>
        <Link href={pathFor(lang, "home")} className="btn btn-primary">
          {UI[lang].tagline}
        </Link>
      </main>
    </>
  );
}
