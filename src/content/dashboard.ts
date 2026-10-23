import type { Locale } from "@/lib/i18n";

export type DashboardStrings = {
  login: {
    metaTitle: string;
    h1: string;
    intro: string;
    email: string;
    sendLink: string;
    sending: string;
    linkSent: string;
    or: string;
    google: string;
    error: string;
    notConfigured: string;
  };
  nav: { dashboard: string; signOut: string };
  home: {
    metaTitle: string;
    h1: string;
    usage: (used: number, limit: number) => string;
    plan: Record<"free" | "starter" | "business", string>;
    promise: string;
    newCode: string;
    name: string;
    namePlaceholder: string;
    destination: string;
    destinationPlaceholder: string;
    create: string;
    empty: string;
    scans7d: string;
    archived: string;
    open: string;
    limitReached: string;
  };
  code: {
    back: string;
    shortLink: string;
    destination: string;
    save: string;
    saved: string;
    archive: string;
    restore: string;
    archivedNote: string;
    download: string;
    analytics: string;
    total: string;
    unique: string;
    countries: string;
    devices: string;
    noScans: string;
    lockedHistory: (days: number) => string;
  };
  errors: Record<
    "invalid" | "shortener" | "self" | "unsafe" | "checkFailed" | "limit" | "rateLimit" | "generic",
    string
  >;
};

const en: DashboardStrings = {
  login: {
    metaTitle: "Sign in | QR Evergreen",
    h1: "Sign in to QR Evergreen",
    intro: "Create editable QR codes and see how often they are scanned. Free accounts get 3 dynamic codes that never expire.",
    email: "Email address",
    sendLink: "Email me a sign-in link",
    sending: "Sending…",
    linkSent: "Check your inbox: we sent you a sign-in link.",
    or: "or",
    google: "Continue with Google",
    error: "Sign-in failed. Please try again.",
    notConfigured: "Accounts are not available yet.",
  },
  nav: { dashboard: "Dashboard", signOut: "Sign out" },
  home: {
    metaTitle: "Dashboard | QR Evergreen",
    h1: "Your dynamic QR codes",
    usage: (used, limit) => `${used} of ${limit} dynamic codes used`,
    plan: { free: "Free plan", starter: "Starter plan", business: "Business plan" },
    promise:
      "Your codes never stop working because of billing. If a paid plan ends, every code keeps redirecting to its last destination.",
    newCode: "New dynamic code",
    name: "Name",
    namePlaceholder: "Table cards, spring flyer…",
    destination: "Destination link",
    destinationPlaceholder: "example.com/menu",
    create: "Create code",
    empty: "No dynamic codes yet. Create one above: you can change where it points at any time, even after printing.",
    scans7d: "Scans (7 days)",
    archived: "Archived",
    open: "Open",
    limitReached: "You have used all dynamic codes on your plan. Existing codes keep working.",
  },
  code: {
    back: "All codes",
    shortLink: "Short link",
    destination: "Destination",
    save: "Save destination",
    saved: "Saved. Printed codes now open the new link.",
    archive: "Archive code",
    restore: "Restore code",
    archivedNote: "This code is archived. People who scan it see a notice instead of your link.",
    download: "Download the code",
    analytics: "Scans",
    total: "Total scans",
    unique: "Unique scans",
    countries: "Top countries",
    devices: "Devices",
    noScans: "No scans yet.",
    lockedHistory: (days) => `The free plan shows the last ${days} days. Upgrade to see your full history.`,
  },
  errors: {
    invalid: "Enter a valid web address starting with http or https.",
    shortener: "Link shorteners are not allowed as destinations. Use the final address instead.",
    self: "A code cannot point to another QR Evergreen link.",
    unsafe: "Google Safe Browsing flags this address as dangerous, so we cannot use it.",
    checkFailed: "We could not check this address right now. Please try again in a minute.",
    limit: "You have reached the dynamic code limit on your plan.",
    rateLimit: "You are creating codes too quickly. Please wait a little and try again.",
    generic: "Something went wrong. Please try again.",
  },
};

const fr: DashboardStrings = {
  login: {
    metaTitle: "Connexion | QR Evergreen",
    h1: "Connexion à QR Evergreen",
    intro:
      "Créez des QR codes modifiables et voyez combien de fois ils sont scannés. Les comptes gratuits ont 3 codes dynamiques qui n'expirent jamais.",
    email: "Adresse e-mail",
    sendLink: "Recevoir un lien de connexion",
    sending: "Envoi…",
    linkSent: "Consultez votre boîte mail : nous vous avons envoyé un lien de connexion.",
    or: "ou",
    google: "Continuer avec Google",
    error: "La connexion a échoué. Réessayez.",
    notConfigured: "Les comptes ne sont pas encore disponibles.",
  },
  nav: { dashboard: "Tableau de bord", signOut: "Se déconnecter" },
  home: {
    metaTitle: "Tableau de bord | QR Evergreen",
    h1: "Vos QR codes dynamiques",
    usage: (used, limit) => `${used} codes dynamiques utilisés sur ${limit}`,
    plan: { free: "Offre gratuite", starter: "Offre Starter", business: "Offre Business" },
    promise:
      "Vos codes ne s'arrêtent jamais pour une question de facturation. Si une offre payante prend fin, chaque code continue de rediriger vers sa dernière destination.",
    newCode: "Nouveau code dynamique",
    name: "Nom",
    namePlaceholder: "Chevalets de table, flyer de printemps…",
    destination: "Lien de destination",
    destinationPlaceholder: "exemple.fr/menu",
    create: "Créer le code",
    empty:
      "Aucun code dynamique pour l'instant. Créez-en un ci-dessus : vous pourrez changer sa destination à tout moment, même après impression.",
    scans7d: "Scans (7 jours)",
    archived: "Archivé",
    open: "Ouvrir",
    limitReached: "Vous avez utilisé tous les codes dynamiques de votre offre. Les codes existants continuent de fonctionner.",
  },
  code: {
    back: "Tous les codes",
    shortLink: "Lien court",
    destination: "Destination",
    save: "Enregistrer la destination",
    saved: "Enregistré. Les codes imprimés ouvrent maintenant le nouveau lien.",
    archive: "Archiver le code",
    restore: "Restaurer le code",
    archivedNote: "Ce code est archivé. Les personnes qui le scannent voient un avis au lieu de votre lien.",
    download: "Télécharger le code",
    analytics: "Scans",
    total: "Scans au total",
    unique: "Scans uniques",
    countries: "Principaux pays",
    devices: "Appareils",
    noScans: "Aucun scan pour l'instant.",
    lockedHistory: (days) => `L'offre gratuite affiche les ${days} derniers jours. Passez à une offre payante pour voir tout l'historique.`,
  },
  errors: {
    invalid: "Saisissez une adresse web valide commençant par http ou https.",
    shortener: "Les raccourcisseurs de liens ne sont pas acceptés. Utilisez l'adresse finale.",
    self: "Un code ne peut pas pointer vers un autre lien QR Evergreen.",
    unsafe: "Google Safe Browsing signale cette adresse comme dangereuse : nous ne pouvons pas l'utiliser.",
    checkFailed: "Impossible de vérifier cette adresse pour le moment. Réessayez dans une minute.",
    limit: "Vous avez atteint la limite de codes dynamiques de votre offre.",
    rateLimit: "Vous créez des codes trop vite. Patientez un peu puis réessayez.",
    generic: "Une erreur est survenue. Réessayez.",
  },
};

export const DASHBOARD: Record<Locale, DashboardStrings> = { en, fr };
