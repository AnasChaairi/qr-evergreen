import Link from "next/link";
import type { ReactNode } from "react";
import type { Faq, Section } from "@/content/types";
import { ArrowRightIcon, ChevronDownIcon } from "./Icons";

export function Sections({ sections }: { sections: Section[] }) {
  return (
    <div className="space-y-10">
      {sections.map((section) => (
        <section key={section.heading} className="space-y-3">
          <h2 className="text-2xl font-bold text-stone-900">{section.heading}</h2>
          {section.paragraphs?.map((paragraph) => (
            <p key={paragraph} className="text-[17px] leading-relaxed text-stone-700">
              {paragraph}
            </p>
          ))}
          {section.list && (
            <ul className="list-disc space-y-2 ps-5 text-[17px] leading-relaxed text-stone-700 marker:text-brand-600">
              {section.list.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </div>
  );
}

export function FaqList({ heading, items }: { heading: string; items: Faq[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
  return (
    <section className="space-y-5">
      <h2 className="text-3xl font-extrabold text-stone-900">{heading}</h2>
      <div className="space-y-3">
        {items.map((item) => (
          <details key={item.q} className="group rounded-2xl border border-stone-200 bg-white px-5 open:shadow-soft sm:px-6">
            <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 py-4 text-lg font-semibold text-stone-900 [&::-webkit-details-marker]:hidden">
              {item.q}
              <ChevronDownIcon className="h-5 w-5 shrink-0 text-brand-700 transition-transform group-open:rotate-180" />
            </summary>
            <p className="pb-5 text-[17px] leading-relaxed text-stone-700">{item.a}</p>
          </details>
        ))}
      </div>
      <JsonLd data={schema} />
    </section>
  );
}

export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // Escape "<" so content can never close the script tag.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

export function ToolCard({ href, title, blurb, icon }: { href: string; title: string; blurb: string; icon?: ReactNode }) {
  return (
    <Link
      href={href}
      className="group flex items-start gap-4 rounded-2xl border border-stone-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-brand-700 hover:shadow-soft"
    >
      {icon && <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">{icon}</span>}
      <span className="min-w-0 flex-1">
        <span className="block text-[17px] font-bold text-stone-900">{title}</span>
        <span className="mt-1 block text-[15px] leading-snug text-stone-600">{blurb}</span>
      </span>
      <ArrowRightIcon className="mt-1 h-5 w-5 shrink-0 text-stone-400 transition group-hover:translate-x-0.5 group-hover:text-brand-700 rtl:rotate-180" />
    </Link>
  );
}
