import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdSlot } from "@/components/AdSlot";
import { FaqList, JsonLd, ToolCard } from "@/components/Content";
import { Generator } from "@/components/Generator";
import { ArrowRightIcon, CheckIcon, ClockIcon, FileIcon, InfinityIcon, LockIcon, PrinterIcon, TYPE_ICONS } from "@/components/Icons";
import { Header } from "@/components/SiteChrome";
import { HOME } from "@/content/pages";
import { TOOLS } from "@/content/tools";
import { UI } from "@/content/ui";
import { absoluteUrl, alternatesFor, isLocale, pathFor } from "@/lib/i18n";
import { CODE_TYPES } from "@/lib/qr/payloads";

export async function generateMetadata({ params }: PageProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const home = HOME[lang];
  return {
    title: home.metaTitle,
    description: home.metaDescription,
    alternates: alternatesFor(lang, "home"),
    openGraph: { title: home.metaTitle, description: home.metaDescription, url: pathFor(lang, "home"), siteName: "QR Evergreen", locale: lang, type: "website" },
  };
}

export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const home = HOME[lang];
  const ui = UI[lang];

  const dashboard = lang === "fr" ? "/fr/dashboard" : "/dashboard";
  const businessHref = { "review-kits": `${dashboard}/review-kits`, menus: `${dashboard}/menus`, codes: dashboard };
  const trustIcons = [ClockIcon, InfinityIcon, LockIcon];
  const promiseIcons = [FileIcon, PrinterIcon, LockIcon];

  return (
    <>
      <Header locale={lang} page="home" />
      <main id="main" className="w-full flex-1">
        <section className="mx-auto max-w-6xl space-y-8 px-4 pb-6 pt-10 sm:px-6 sm:pt-14">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="min-w-0 max-w-3xl flex-[1_1_520px] space-y-4">
              <p className="chip bg-sun-100 text-sun-900">
                <CheckIcon className="h-4 w-4" />
                {home.badge}
              </p>
              <h1 className="text-4xl font-extrabold leading-[1.05] text-stone-900 sm:text-5xl lg:text-6xl">{home.h1}</h1>
              <p className="max-w-2xl text-lg leading-relaxed text-stone-600 sm:text-xl">{home.intro}</p>
            </div>
            <ul className="space-y-2.5 text-[15px] font-medium text-stone-700">
              {home.trust.map((point, i) => {
                const Icon = trustIcons[i % trustIcons.length];
                return (
                  <li key={point} className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                      <Icon className="h-4 w-4" />
                    </span>
                    {point}
                  </li>
                );
              })}
            </ul>
          </div>
          <Generator t={ui.generator} initialType="url" showTypeTabs />
          <AdSlot placement="belowGenerator" />
        </section>

        <section className="mx-auto max-w-6xl space-y-7 px-4 pt-16 sm:px-6">
          <h2 className="text-3xl font-extrabold text-stone-900 sm:text-4xl">{home.promiseHeading}</h2>
          <div className="grid gap-5 md:grid-cols-3">
            {home.promisePoints.map((point, i) => {
              const Icon = promiseIcons[i % promiseIcons.length];
              return (
                <div key={point.title} className="rounded-3xl border border-stone-200 bg-white p-7">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                    <Icon />
                  </span>
                  <h3 className="mt-4 font-sans text-lg font-bold tracking-normal text-stone-900">{point.title}</h3>
                  <p className="mt-2 text-base leading-relaxed text-stone-600">{point.body}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mx-auto max-w-6xl space-y-7 px-4 pt-16 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl space-y-2">
              <h2 className="text-3xl font-extrabold text-stone-900 sm:text-4xl">{home.business.heading}</h2>
              <p className="text-lg text-stone-600">{home.business.intro}</p>
            </div>
            <Link href={dashboard} className="btn btn-primary">
              {home.business.cta}
            </Link>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {home.business.cards.map((card, i) => {
              const featured = i === 0;
              return (
                <Link
                  key={card.title}
                  href={businessHref[card.href]}
                  className={`group flex min-h-64 flex-col gap-3 rounded-3xl p-7 transition hover:-translate-y-0.5 hover:shadow-lift ${
                    featured ? "bg-stone-900 text-white" : "border border-stone-200 bg-white text-stone-900"
                  }`}
                >
                  <span className={`chip self-start ${featured ? "bg-sun-300 text-sun-900" : "bg-brand-50 text-brand-800"}`}>{card.tag}</span>
                  <h3 className="text-2xl font-bold leading-tight">{card.title}</h3>
                  <p className={`text-base leading-relaxed ${featured ? "text-stone-300" : "text-stone-600"}`}>{card.body}</p>
                  <span className={`mt-auto inline-flex items-center gap-1.5 font-bold ${featured ? "text-sun-300" : "text-brand-700"}`}>
                    {card.cta}
                    <ArrowRightIcon className="h-5 w-5 transition group-hover:translate-x-0.5 rtl:rotate-180" />
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        <section id="tools" className="mx-auto max-w-6xl scroll-mt-6 space-y-7 px-4 pt-16 sm:px-6">
          <h2 className="text-3xl font-extrabold text-stone-900 sm:text-4xl">{home.toolsHeading}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CODE_TYPES.map((type) => {
              const Icon = TYPE_ICONS[type];
              return (
                <ToolCard key={type} href={pathFor(lang, type)} title={TOOLS[lang][type].h1} blurb={home.toolBlurbs[type]} icon={<Icon />} />
              );
            })}
          </div>
        </section>

        <div className="mx-auto max-w-3xl px-4 pt-16 sm:px-6">
          <FaqList heading={ui.faqHeading} items={home.faq} />
        </div>
      </main>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "QR Evergreen",
          url: absoluteUrl(pathFor(lang, "home")),
          applicationCategory: "UtilitiesApplication",
          operatingSystem: "Any",
          inLanguage: lang,
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        }}
      />
    </>
  );
}
