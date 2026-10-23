import type { Locale } from "@/lib/i18n";
import type { CodeType, EncodeError } from "@/lib/qr/payloads";

// Strings used by shared components. Kept plain and serializable so the
// generator (a client component) can receive its part as a prop.

export type GeneratorStrings = {
  typeLabels: Record<CodeType, string>;
  fields: {
    ssid: string;
    password: string;
    security: string;
    securityOptions: { WPA: string; WEP: string; nopass: string };
    hidden: string;
    url: string;
    urlPlaceholder: string;
    phone: string;
    phonePlaceholder: string;
    message: string;
    messagePlaceholder: string;
    review: string;
    reviewPlaceholder: string;
    reviewHelp: string;
    firstName: string;
    lastName: string;
    organization: string;
    title: string;
    vcardPhone: string;
    email: string;
    website: string;
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  design: {
    heading: string;
    foreground: string;
    background: string;
    dots: string;
    corners: string;
    dotOptions: Record<"square" | "rounded" | "dots" | "classy" | "extra-rounded", string>;
    cornerOptions: Record<"square" | "extra-rounded" | "dot", string>;
    logo: string;
    logoRemove: string;
    logoTooLarge: string;
    frame: string;
    frameText: string;
    frameColor: string;
    frameTextColor: string;
    contrastWarning: string;
  };
  defaultFrameText: Record<CodeType, string>;
  preview: string;
  previewEmpty: string;
  download: string;
  downloading: string;
  privacyNote: string;
  errors: Record<EncodeError, string>;
};

export type UiStrings = {
  siteName: string;
  tagline: string;
  nav: { tools: string; about: string; switchLanguage: string; skipToContent: string };
  footer: { promise: string; tools: string; company: string; rights: string };
  relatedTools: string;
  faqHeading: string;
  onThisPage: string;
  generator: GeneratorStrings;
};

const en: UiStrings = {
  siteName: "QR Evergreen",
  tagline: "Free QR codes that never die.",
  nav: { tools: "Tools", about: "About", switchLanguage: "Français", skipToContent: "Skip to content" },
  footer: {
    promise:
      "Free codes never die. Static codes hold their data inside the pattern, so they keep working even if this site disappears.",
    tools: "Free tools",
    company: "QR Evergreen",
    rights: "All rights reserved.",
  },
  relatedTools: "Related free tools",
  faqHeading: "Frequently asked questions",
  onThisPage: "On this page",
  generator: {
    typeLabels: { wifi: "WiFi", url: "Link", whatsapp: "WhatsApp", review: "Google review", vcard: "Contact card" },
    fields: {
      ssid: "Network name (SSID)",
      password: "Password",
      security: "Security",
      securityOptions: { WPA: "WPA / WPA2 / WPA3", WEP: "WEP (old)", nopass: "No password" },
      hidden: "Hidden network",
      url: "Website address",
      urlPlaceholder: "example.com/menu",
      phone: "WhatsApp number with country code",
      phonePlaceholder: "+33 6 12 34 56 78",
      message: "Pre-filled message (optional)",
      messagePlaceholder: "Hello, I'd like to book a table",
      review: "Google Place ID or review link",
      reviewPlaceholder: "ChIJ… or https://g.page/r/…/review",
      reviewHelp:
        "In your Google Business Profile, choose “Ask for reviews” and copy the link, or look up your Place ID with Google's Place ID Finder.",
      firstName: "First name",
      lastName: "Last name",
      organization: "Company",
      title: "Job title",
      vcardPhone: "Phone",
      email: "Email",
      website: "Website",
      street: "Street",
      city: "City",
      postalCode: "Postal code",
      country: "Country",
    },
    design: {
      heading: "Design",
      foreground: "Code colour",
      background: "Background",
      dots: "Pattern",
      corners: "Corners",
      dotOptions: { square: "Square", rounded: "Rounded", dots: "Dots", classy: "Classy", "extra-rounded": "Soft" },
      cornerOptions: { square: "Square", "extra-rounded": "Rounded", dot: "Circle" },
      logo: "Logo (optional)",
      logoRemove: "Remove logo",
      logoTooLarge: "Please choose an image under 2 MB.",
      frame: "Add a frame with a call to action",
      frameText: "Frame text",
      frameColor: "Frame colour",
      frameTextColor: "Text colour",
      contrastWarning: "Use a dark code on a light background. Light or low-contrast codes may not scan.",
    },
    defaultFrameText: {
      wifi: "Scan for WiFi",
      url: "Scan me",
      whatsapp: "Chat with us",
      review: "Leave a review",
      vcard: "Save my contact",
    },
    preview: "Preview",
    previewEmpty: "Fill in the form to see your code.",
    download: "Download",
    downloading: "Preparing…",
    privacyNote: "Made in your browser. Nothing you type is sent to our servers, and the code never expires.",
    errors: {
      ssidRequired: "Enter the network name.",
      passwordRequired: "Enter the password, or choose “No password”.",
      urlRequired: "Enter a website address.",
      urlInvalid: "This doesn't look like a web address.",
      phoneRequired: "Enter a phone number.",
      phoneInvalid: "Use the full international number, for example +33 6 12 34 56 78.",
      reviewRequired: "Enter your Place ID or review link.",
      reviewInvalid: "Use a Google Place ID or a Google review link.",
      nameRequired: "Enter a name or a company.",
    },
  },
};

const fr: UiStrings = {
  siteName: "QR Evergreen",
  tagline: "Des QR codes gratuits qui n'expirent jamais.",
  nav: { tools: "Outils", about: "À propos", switchLanguage: "English", skipToContent: "Aller au contenu" },
  footer: {
    promise:
      "Les codes gratuits n'expirent jamais. Un code statique contient ses données dans le motif : il fonctionne même si ce site disparaît.",
    tools: "Outils gratuits",
    company: "QR Evergreen",
    rights: "Tous droits réservés.",
  },
  relatedTools: "Autres outils gratuits",
  faqHeading: "Questions fréquentes",
  onThisPage: "Sur cette page",
  generator: {
    typeLabels: { wifi: "WiFi", url: "Lien", whatsapp: "WhatsApp", review: "Avis Google", vcard: "Carte de contact" },
    fields: {
      ssid: "Nom du réseau (SSID)",
      password: "Mot de passe",
      security: "Sécurité",
      securityOptions: { WPA: "WPA / WPA2 / WPA3", WEP: "WEP (ancien)", nopass: "Sans mot de passe" },
      hidden: "Réseau masqué",
      url: "Adresse du site",
      urlPlaceholder: "exemple.fr/menu",
      phone: "Numéro WhatsApp avec indicatif",
      phonePlaceholder: "+33 6 12 34 56 78",
      message: "Message pré-rempli (facultatif)",
      messagePlaceholder: "Bonjour, je voudrais réserver une table",
      review: "Place ID Google ou lien d'avis",
      reviewPlaceholder: "ChIJ… ou https://g.page/r/…/review",
      reviewHelp:
        "Dans votre fiche Google Business Profile, choisissez « Demander des avis » et copiez le lien, ou trouvez votre Place ID avec l'outil Place ID Finder de Google.",
      firstName: "Prénom",
      lastName: "Nom",
      organization: "Entreprise",
      title: "Fonction",
      vcardPhone: "Téléphone",
      email: "E-mail",
      website: "Site web",
      street: "Rue",
      city: "Ville",
      postalCode: "Code postal",
      country: "Pays",
    },
    design: {
      heading: "Apparence",
      foreground: "Couleur du code",
      background: "Fond",
      dots: "Motif",
      corners: "Coins",
      dotOptions: { square: "Carré", rounded: "Arrondi", dots: "Points", classy: "Élégant", "extra-rounded": "Doux" },
      cornerOptions: { square: "Carré", "extra-rounded": "Arrondi", dot: "Cercle" },
      logo: "Logo (facultatif)",
      logoRemove: "Retirer le logo",
      logoTooLarge: "Choisissez une image de moins de 2 Mo.",
      frame: "Ajouter un cadre avec un appel à l'action",
      frameText: "Texte du cadre",
      frameColor: "Couleur du cadre",
      frameTextColor: "Couleur du texte",
      contrastWarning: "Utilisez un code foncé sur un fond clair. Un code clair ou peu contrasté risque de ne pas être lu.",
    },
    defaultFrameText: {
      wifi: "Scannez pour le WiFi",
      url: "Scannez-moi",
      whatsapp: "Écrivez-nous",
      review: "Laissez un avis",
      vcard: "Mon contact",
    },
    preview: "Aperçu",
    previewEmpty: "Remplissez le formulaire pour voir votre code.",
    download: "Télécharger",
    downloading: "Préparation…",
    privacyNote:
      "Créé dans votre navigateur. Rien de ce que vous tapez n'est envoyé à nos serveurs, et le code n'expire jamais.",
    errors: {
      ssidRequired: "Saisissez le nom du réseau.",
      passwordRequired: "Saisissez le mot de passe, ou choisissez « Sans mot de passe ».",
      urlRequired: "Saisissez une adresse web.",
      urlInvalid: "Cette adresse web ne semble pas valide.",
      phoneRequired: "Saisissez un numéro de téléphone.",
      phoneInvalid: "Utilisez le numéro international complet, par exemple +33 6 12 34 56 78.",
      reviewRequired: "Saisissez votre Place ID ou votre lien d'avis.",
      reviewInvalid: "Utilisez un Place ID Google ou un lien d'avis Google.",
      nameRequired: "Saisissez un nom ou une entreprise.",
    },
  },
};

export const UI: Record<Locale, UiStrings> = { en, fr };
