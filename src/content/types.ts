export type Section = {
  heading: string;
  paragraphs?: string[];
  list?: string[];
};

export type Faq = { q: string; a: string };

export type ToolContent = {
  metaTitle: string;
  metaDescription: string;
  h1: string;
  intro: string;
  upsell: string;
  sections: Section[];
  faq: Faq[];
};

export type InfoPageContent = {
  metaTitle: string;
  metaDescription: string;
  h1: string;
  updated?: string;
  sections: Section[];
};

export type HomeContent = {
  metaTitle: string;
  metaDescription: string;
  h1: string;
  intro: string;
  toolsHeading: string;
  toolBlurbs: Record<"wifi" | "url" | "whatsapp" | "review" | "vcard", string>;
  promiseHeading: string;
  promisePoints: { title: string; body: string }[];
  faq: Faq[];
};
