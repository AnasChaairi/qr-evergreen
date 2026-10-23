import Link from "next/link";
import type { Faq, Section } from "@/content/types";

export function Sections({ sections }: { sections: Section[] }) {
  return (
    <div className="space-y-8">
      {sections.map((section) => (
        <section key={section.heading} className="space-y-3">
          <h2 className="text-xl font-semibold text-stone-900">{section.heading}</h2>
          {section.paragraphs?.map((paragraph) => (
            <p key={paragraph} className="leading-relaxed text-stone-700">
              {paragraph}
            </p>
          ))}
          {section.list && (
            <ul className="list-disc space-y-1 pl-5 leading-relaxed text-stone-700">
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
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-stone-900">{heading}</h2>
      <div className="divide-y divide-stone-200 rounded-xl border border-stone-200 bg-white">
        {items.map((item) => (
          <details key={item.q} className="group p-4">
            <summary className="cursor-pointer font-medium text-stone-900">{item.q}</summary>
            <p className="mt-2 leading-relaxed text-stone-700">{item.a}</p>
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

export function ToolCard({ href, title, blurb }: { href: string; title: string; blurb: string }) {
  return (
    <Link
      href={href}
      className="block rounded-xl border border-stone-200 bg-white p-4 transition-colors hover:border-brand-600 hover:bg-brand-50"
    >
      <span className="block font-semibold text-stone-900">{title}</span>
      <span className="mt-1 block text-sm text-stone-600">{blurb}</span>
    </Link>
  );
}
