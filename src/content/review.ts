import type { Locale } from "@/lib/i18n";
import type { ExtraPlatform, PrintDesign, PrintItemId } from "@/lib/review/kit";

// Strings for the review kit dashboard and print pack. Plain data so client
// components can receive them.
export type ReviewStrings = {
  nav: string;
  metaTitle: string;
  h1: string;
  intro: string;
  noGating: string;
  create: {
    heading: string;
    businessName: string;
    search: string;
    searchPlaceholder: string;
    searchButton: string;
    searching: string;
    noResults: string;
    searchUnavailable: string;
    choose: string;
    reviewLink: string;
    reviewLinkHelp: string;
    extras: string;
    color: string;
    submit: string;
  };
  platforms: Record<ExtraPlatform | "google", string>;
  list: { empty: string; open: string };
  kit: {
    back: string;
    shortLink: string;
    publicPage: string;
    save: string;
    saved: string;
    pack: string;
    packIntro: string;
    design: string;
    designs: Record<PrintDesign, string>;
    lockedDesign: string;
    logo: string;
    generate: string;
    generating: string;
    failed: string;
    scansByItem: string;
    noScans: string;
  };
  items: Record<PrintItemId | "direct", string>;
  print: {
    headline: string;
    subline: string;
    scanHint: string;
    fold: string;
  };
  publicPage: {
    title: (business: string) => string;
    intro: string;
    google: string;
    others: string;
    thanks: string;
  };
  errors: Record<"review" | "extra" | "kitLimit", string>;
};

const en: ReviewStrings = {
  nav: "Review kits",
  metaTitle: "Review QR kit | QR Evergreen",
  h1: "Google review QR kit",
  intro:
    "Find your business, and we build the review link and a print pack: counter stand, table tent, window sticker, receipt card and staff badge.",
  noGating:
    "Every customer who scans goes to the same review page. Google's rules forbid asking only happy customers, or offering rewards for reviews.",
  create: {
    heading: "New review kit",
    businessName: "Business name",
    search: "Find your business on Google",
    searchPlaceholder: "Café Atlas, Rabat",
    searchButton: "Search",
    searching: "Searching…",
    noResults: "No match. Try adding the city, or paste your review link below.",
    searchUnavailable: "Business search is not available yet. Paste your review link or Place ID below.",
    choose: "Use this business",
    reviewLink: "Google review link or Place ID",
    reviewLinkHelp: "Filled in when you pick a search result. You can also paste the link from your Business Profile.",
    extras: "Other review sites (optional)",
    color: "Brand colour",
    submit: "Create kit",
  },
  platforms: {
    google: "Google",
    tripadvisor: "Tripadvisor",
    facebook: "Facebook",
    trustpilot: "Trustpilot",
    booking: "Booking.com",
  },
  list: { empty: "No review kits yet.", open: "Open" },
  kit: {
    back: "All review kits",
    shortLink: "Short link",
    publicPage: "Review page",
    save: "Save links",
    saved: "Saved. Printed codes use the new links right away.",
    pack: "Print pack",
    packIntro:
      "One PDF with every item, each with its own tracking link so you can see which one gets scanned. Your logo is added in your browser and is not uploaded.",
    design: "Design",
    designs: { classic: "Classic", minimal: "Minimal", bold: "Bold", split: "Split" },
    lockedDesign: "Paid plans",
    logo: "Logo (optional)",
    generate: "Download print pack (PDF)",
    generating: "Building your PDF…",
    failed: "The PDF could not be built. Try another logo file, or none.",
    scansByItem: "Scans by printed item (30 days)",
    noScans: "No scans yet.",
  },
  items: {
    "counter-stand": "Counter stand (A6)",
    "table-tent": "Table tent (A5, folded)",
    "window-sticker": "Window sticker",
    "receipt-card": "Receipt card",
    "staff-badge": "Staff badge",
    direct: "Other or unknown",
  },
  print: {
    headline: "Enjoyed your visit?",
    subline: "Leave us a review",
    scanHint: "Scan with your phone camera",
    fold: "Fold here",
  },
  publicPage: {
    title: (business) => `Review ${business}`,
    intro: "Thank you for taking a moment to share your experience.",
    google: "Write a review on Google",
    others: "Or review us on",
    thanks: "Thank you!",
  },
  errors: {
    review: "Use a Google review link or a Place ID.",
    extra: "One of the extra links is not on the site it is listed under.",
    kitLimit: "You have reached the review kit limit on your plan.",
  },
};

const fr: ReviewStrings = {
  nav: "Kits avis",
  metaTitle: "Kit QR avis | QR Evergreen",
  h1: "Kit QR code avis Google",
  intro:
    "Trouvez votre établissement : nous créons le lien d'avis et un kit à imprimer (présentoir de comptoir, chevalet de table, vitrophanie, carte ticket et badge).",
  noGating:
    "Chaque client qui scanne arrive sur la même page d'avis. Le règlement de Google interdit de ne solliciter que les clients satisfaits, ou d'offrir une récompense contre un avis.",
  create: {
    heading: "Nouveau kit avis",
    businessName: "Nom de l'établissement",
    search: "Trouver votre établissement sur Google",
    searchPlaceholder: "Café Atlas, Rabat",
    searchButton: "Rechercher",
    searching: "Recherche…",
    noResults: "Aucun résultat. Ajoutez la ville, ou collez votre lien d'avis ci-dessous.",
    searchUnavailable: "La recherche n'est pas encore disponible. Collez votre lien d'avis ou votre Place ID ci-dessous.",
    choose: "Choisir",
    reviewLink: "Lien d'avis Google ou Place ID",
    reviewLinkHelp: "Rempli quand vous choisissez un résultat. Vous pouvez aussi coller le lien de votre fiche Google.",
    extras: "Autres sites d'avis (facultatif)",
    color: "Couleur de la marque",
    submit: "Créer le kit",
  },
  platforms: {
    google: "Google",
    tripadvisor: "Tripadvisor",
    facebook: "Facebook",
    trustpilot: "Trustpilot",
    booking: "Booking.com",
  },
  list: { empty: "Aucun kit avis pour l'instant.", open: "Ouvrir" },
  kit: {
    back: "Tous les kits avis",
    shortLink: "Lien court",
    publicPage: "Page d'avis",
    save: "Enregistrer les liens",
    saved: "Enregistré. Les codes imprimés utilisent les nouveaux liens immédiatement.",
    pack: "Kit à imprimer",
    packIntro:
      "Un seul PDF avec tous les supports, chacun avec son propre lien de suivi pour savoir lequel est scanné. Votre logo est ajouté dans votre navigateur et n'est pas envoyé.",
    design: "Style",
    designs: { classic: "Classique", minimal: "Minimal", bold: "Affirmé", split: "Deux tons" },
    lockedDesign: "Offres payantes",
    logo: "Logo (facultatif)",
    generate: "Télécharger le kit (PDF)",
    generating: "Création du PDF…",
    failed: "Le PDF n'a pas pu être créé. Essayez un autre fichier de logo, ou aucun.",
    scansByItem: "Scans par support (30 jours)",
    noScans: "Aucun scan pour l'instant.",
  },
  items: {
    "counter-stand": "Présentoir de comptoir (A6)",
    "table-tent": "Chevalet de table (A5 plié)",
    "window-sticker": "Vitrophanie",
    "receipt-card": "Carte ticket",
    "staff-badge": "Badge du personnel",
    direct: "Autre ou inconnu",
  },
  print: {
    headline: "Vous avez aimé votre visite ?",
    subline: "Laissez-nous un avis",
    scanHint: "Scannez avec l'appareil photo",
    fold: "Pliez ici",
  },
  publicPage: {
    title: (business) => `Donner votre avis sur ${business}`,
    intro: "Merci de prendre un instant pour partager votre expérience.",
    google: "Écrire un avis sur Google",
    others: "Ou donnez votre avis sur",
    thanks: "Merci !",
  },
  errors: {
    review: "Utilisez un lien d'avis Google ou un Place ID.",
    extra: "Un des liens supplémentaires n'est pas sur le site indiqué.",
    kitLimit: "Vous avez atteint la limite de kits avis de votre offre.",
  },
};

export const REVIEW: Record<Locale, ReviewStrings> = { en, fr };

// The subset that can be passed to client components (no functions).
export function reviewClientStrings(locale: Locale) {
  const { publicPage: _publicPage, ...rest } = REVIEW[locale];
  void _publicPage;
  return rest;
}
