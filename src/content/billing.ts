import type { Locale } from "@/lib/i18n";
import type { Plan } from "@/lib/dynamic/plans";
import type { Faq } from "./types";

// Pricing page and billing dashboard strings. The promise is shown on both,
// as the spec asks for it on every pricing and checkout page.

export type BillingStrings = {
  pricing: {
    metaTitle: string;
    metaDescription: string;
    h1: string;
    intro: string;
    monthly: string;
    yearly: string;
    perMonth: string;
    perYear: string;
    yearlySaving: string;
    free: string;
    startFree: string;
    choose: string;
    feature: string;
    rows: { label: string; values: Record<Plan, string> }[];
    localPricing: string;
    faqHeading: string;
    faq: Faq[];
  };
  promise: { heading: string; points: string[] };
  planNames: Record<Plan, string>;
  dashboard: {
    nav: string;
    metaTitle: string;
    h1: string;
    current: string;
    status: Record<"active" | "past_due" | "canceled", string>;
    renews: (date: string) => string;
    ends: (date: string) => string;
    lapsed: string;
    upgrade: string;
    monthly: (price: number) => string;
    yearly: (price: number) => string;
    manage: string;
    notConfigured: string;
    checkoutFailed: string;
    thanks: string;
  };
};

const en: BillingStrings = {
  pricing: {
    metaTitle: "Pricing: free forever, paid plans from $5 | QR Evergreen",
    metaDescription:
      "Free QR codes that never expire. Starter at $5/month and Business at $12/month for dynamic codes, review kits and menus. No code ever stops working because of billing.",
    h1: "Simple pricing, codes that never die",
    intro: "Start free and stay free as long as you like. Upgrade when you need more dynamic codes, the menu builder or your whole team.",
    monthly: "Monthly",
    yearly: "Yearly",
    perMonth: "/month",
    perYear: "/year",
    yearlySaving: "2 months free",
    free: "Free",
    startFree: "Start free",
    choose: "Choose",
    feature: "Feature",
    rows: [
      { label: "Static codes", values: { free: "Unlimited, never expire", starter: "Unlimited", business: "Unlimited" } },
      { label: "Dynamic codes", values: { free: "3, never expire", starter: "25", business: "250" } },
      { label: "Scans", values: { free: "Unlimited", starter: "Unlimited", business: "Unlimited" } },
      { label: "Analytics history", values: { free: "7 days", starter: "1 year", business: "Unlimited + CSV export" } },
      { label: "Review QR kit", values: { free: "1 business, 2 print designs", starter: "1 business, all designs", business: "5 businesses" } },
      { label: "Menu QR", values: { free: "1 menu, PDF only", starter: "1 menu, menu builder", business: "5 menus, multi-language" } },
      { label: "Ads on our pages", values: { free: "Yes", starter: "No", business: "No" } },
      { label: "Team members", values: { free: "1", starter: "1", business: "3" } },
    ],
    localPricing: "Prices are in US dollars. Taxes are handled by our payment provider, Lemon Squeezy, at checkout.",
    faqHeading: "Questions",
    faq: [
      {
        q: "Is there a free trial?",
        a: "The free plan is the trial, and it never expires. You can use it for as long as you like and upgrade only when you need more.",
      },
      {
        q: "What happens to my codes if I stop paying?",
        a: "Every dynamic code keeps redirecting to its last destination, forever. Editing and longer analytics are locked until you come back, and you can still create static codes.",
      },
      {
        q: "Can I cancel any time?",
        a: "Yes. You keep your paid plan until the end of the period you paid for, then your account moves to the free plan. Your codes keep working.",
      },
      {
        q: "Do you offer invoices?",
        a: "Yes. Every payment comes with an invoice from our payment provider, which you can also download from the billing portal.",
      },
    ],
  },
  promise: {
    heading: "Our promise",
    points: [
      "Free dynamic codes never expire and are never redirected to an upgrade page.",
      "If a paid plan ends, every dynamic code keeps redirecting to its last destination forever; only editing and analytics are locked until you return.",
      "Above the free limit, new dynamic codes cannot be created; existing ones are never switched off.",
    ],
  },
  planNames: { free: "Free", starter: "Starter", business: "Business" },
  dashboard: {
    nav: "Plan",
    metaTitle: "Plan and billing | QR Evergreen",
    h1: "Plan and billing",
    current: "Current plan",
    status: { active: "Active", past_due: "Payment failed, we are retrying", canceled: "Cancelled" },
    renews: (date) => `Renews on ${date}`,
    ends: (date) => `Paid features until ${date}`,
    lapsed: "Your paid plan has ended. Your codes keep working; editing beyond the free limits is locked until you upgrade again.",
    upgrade: "Upgrade",
    monthly: (price) => `$${price} monthly`,
    yearly: (price) => `$${price} yearly`,
    manage: "Change plan, payment method or invoices",
    notConfigured: "Payments are not set up yet.",
    checkoutFailed: "We could not open the checkout. Please try again.",
    thanks: "Thank you! Your plan updates as soon as the payment is confirmed, usually within a minute.",
  },
};

const fr: BillingStrings = {
  pricing: {
    metaTitle: "Tarifs : gratuit pour toujours, offres dès 5 $ | QR Evergreen",
    metaDescription:
      "Des QR codes gratuits qui n'expirent jamais. Starter à 5 $/mois et Business à 12 $/mois pour les codes dynamiques, kits avis et menus. Aucun code ne s'arrête à cause d'un paiement.",
    h1: "Des tarifs simples, des codes qui ne meurent jamais",
    intro: "Commencez gratuitement et restez-y aussi longtemps que vous voulez. Passez à une offre payante quand il vous faut plus de codes dynamiques, l'éditeur de menu ou votre équipe.",
    monthly: "Mensuel",
    yearly: "Annuel",
    perMonth: "/mois",
    perYear: "/an",
    yearlySaving: "2 mois offerts",
    free: "Gratuit",
    startFree: "Commencer gratuitement",
    choose: "Choisir",
    feature: "Fonction",
    rows: [
      { label: "Codes statiques", values: { free: "Illimités, sans expiration", starter: "Illimités", business: "Illimités" } },
      { label: "Codes dynamiques", values: { free: "3, sans expiration", starter: "25", business: "250" } },
      { label: "Scans", values: { free: "Illimités", starter: "Illimités", business: "Illimités" } },
      { label: "Historique des statistiques", values: { free: "7 jours", starter: "1 an", business: "Illimité + export CSV" } },
      { label: "Kit QR avis", values: { free: "1 établissement, 2 styles", starter: "1 établissement, tous les styles", business: "5 établissements" } },
      { label: "Menu QR", values: { free: "1 menu, PDF uniquement", starter: "1 menu, éditeur de menu", business: "5 menus, multilingues" } },
      { label: "Publicités sur nos pages", values: { free: "Oui", starter: "Non", business: "Non" } },
      { label: "Membres de l'équipe", values: { free: "1", starter: "1", business: "3" } },
    ],
    localPricing: "Prix en dollars américains. Les taxes sont gérées par notre prestataire de paiement, Lemon Squeezy, au moment du paiement.",
    faqHeading: "Questions",
    faq: [
      {
        q: "Y a-t-il un essai gratuit ?",
        a: "L'offre gratuite est l'essai, et elle n'expire jamais. Utilisez-la aussi longtemps que vous voulez et passez à une offre payante seulement quand vous en avez besoin.",
      },
      {
        q: "Que deviennent mes codes si j'arrête de payer ?",
        a: "Chaque code dynamique continue de rediriger vers sa dernière destination, pour toujours. La modification et l'historique long sont bloqués jusqu'à votre retour, et vous pouvez toujours créer des codes statiques.",
      },
      {
        q: "Puis-je résilier à tout moment ?",
        a: "Oui. Vous gardez votre offre jusqu'à la fin de la période payée, puis votre compte passe à l'offre gratuite. Vos codes continuent de fonctionner.",
      },
      {
        q: "Recevrai-je des factures ?",
        a: "Oui. Chaque paiement est accompagné d'une facture de notre prestataire, téléchargeable aussi depuis le portail de facturation.",
      },
    ],
  },
  promise: {
    heading: "Notre promesse",
    points: [
      "Les codes dynamiques gratuits n'expirent jamais et ne sont jamais redirigés vers une page de mise à niveau.",
      "Si une offre payante prend fin, chaque code dynamique continue de rediriger vers sa dernière destination pour toujours ; seules la modification et les statistiques sont bloquées jusqu'à votre retour.",
      "Au-delà de la limite gratuite, vous ne pouvez plus créer de nouveaux codes dynamiques ; ceux qui existent ne sont jamais désactivés.",
    ],
  },
  planNames: { free: "Gratuit", starter: "Starter", business: "Business" },
  dashboard: {
    nav: "Offre",
    metaTitle: "Offre et facturation | QR Evergreen",
    h1: "Offre et facturation",
    current: "Offre actuelle",
    status: { active: "Active", past_due: "Paiement refusé, nouvelle tentative en cours", canceled: "Résiliée" },
    renews: (date) => `Renouvellement le ${date}`,
    ends: (date) => `Fonctions payantes jusqu'au ${date}`,
    lapsed: "Votre offre payante est terminée. Vos codes continuent de fonctionner ; les modifications au-delà des limites gratuites sont bloquées jusqu'à votre retour.",
    upgrade: "Passer à cette offre",
    monthly: (price) => `${price} $ par mois`,
    yearly: (price) => `${price} $ par an`,
    manage: "Changer d'offre, de moyen de paiement ou voir les factures",
    notConfigured: "Les paiements ne sont pas encore configurés.",
    checkoutFailed: "Impossible d'ouvrir le paiement. Réessayez.",
    thanks: "Merci ! Votre offre est mise à jour dès que le paiement est confirmé, généralement en moins d'une minute.",
  },
};

export const BILLING: Record<Locale, BillingStrings> = { en, fr };
