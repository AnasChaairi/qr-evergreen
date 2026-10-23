import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdSlot } from "@/components/AdSlot";
import { FaqList, JsonLd, ToolCard } from "@/components/Content";
import { Generator } from "@/components/Generator";
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

  return (
    <>
      <Header locale={lang} page="home" />
      <main id="main" className="mx-auto w-full max-w-6xl flex-1 space-y-12 px-4 py-8 sm:py-12">
        <section className="space-y-6">
          <div className="max-w-3xl space-y-3">
            <h1 className="text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">{home.h1}</h1>
            <p className="text-lg leading-relaxed text-stone-600">{home.intro}</p>
          </div>
          <Generator t={ui.generator} initialType="url" showTypeTabs />
          <AdSlot placement="belowGenerator" />
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-stone-900">{home.toolsHeading}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CODE_TYPES.map((type) => (
              <ToolCard key={type} href={pathFor(lang, type)} title={TOOLS[lang][type].h1} blurb={home.toolBlurbs[type]} />
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-stone-900">{home.promiseHeading}</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {home.promisePoints.map((point) => (
              <div key={point.title} className="rounded-xl border border-brand-600/30 bg-brand-50 p-5">
                <h3 className="font-semibold text-brand-800">{point.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-700">{point.body}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="max-w-3xl">
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
