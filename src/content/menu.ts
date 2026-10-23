import type { Locale } from "@/lib/i18n";
import type { Allergen, Day, MenuLang } from "@/lib/menu/menu";

// Strings for the menu dashboard (EN/FR) and the public menu page (every menu
// language). Plain data so client components can receive them.

export type MenuStrings = {
  nav: string;
  metaTitle: string;
  h1: string;
  intro: string;
  list: { empty: string; open: string; file: string; builder: string };
  create: {
    heading: string;
    title: string;
    titlePlaceholder: string;
    language: string;
    submit: string;
  };
  mode: {
    heading: string;
    file: string;
    fileHelp: string;
    builder: string;
    builderHelp: string;
    locked: string;
  };
  edit: {
    back: string;
    shortLink: string;
    publicPage: string;
    download: string;
    settings: string;
    title: string;
    languages: string;
    languagesHelp: string;
    languagesLocked: string;
    color: string;
    phone: string;
    whatsapp: string;
    hours: string;
    closed: string;
    opens: string;
    closes: string;
    save: string;
    saved: string;
    builderLocked: string;
  };
  upload: {
    heading: string;
    help: string;
    choose: string;
    uploading: string;
    current: string;
    replace: string;
    done: string;
  };
  builder: {
    heading: string;
    addSection: string;
    sectionTitle: string;
    addItem: string;
    itemName: string;
    description: string;
    price: string;
    photo: string;
    removePhoto: string;
    allergens: string;
    remove: string;
    up: string;
    down: string;
    save: string;
    saving: string;
    saved: string;
    unsaved: string;
  };
  pack: { heading: string; intro: string; generate: string; generating: string; failed: string };
  print: { headline: string; subline: string; scanHint: string; fold: string };
  days: Record<Day, string>;
  langNames: Record<MenuLang, string>;
  allergens: Record<Allergen, string>;
  errors: Record<"menuLimit" | "builderLocked" | "languages" | "phone" | "whatsapp" | "file" | "fileSize" | "menuInvalid", string>;
};

const LANG_NAMES: Record<MenuLang, string> = { en: "English", fr: "Français", ar: "العربية", es: "Español" };

const en: MenuStrings = {
  nav: "Menus",
  metaTitle: "Menu QR | QR Evergreen",
  h1: "Menu QR code",
  intro:
    "Upload your menu as a PDF or photo, or build it here. The printed code never changes, so you can update prices and dishes any time.",
  list: { empty: "No menus yet.", open: "Open", file: "PDF or image", builder: "Built here" },
  create: {
    heading: "New menu",
    title: "Restaurant or menu name",
    titlePlaceholder: "Café Atlas",
    language: "Menu language",
    submit: "Create menu",
  },
  mode: {
    heading: "What customers see",
    file: "Uploaded PDF or image",
    fileHelp: "Your existing menu file, shown on a mobile page with your hours and buttons.",
    builder: "Menu built here",
    builderHelp: "Sections, dishes, prices, photos and allergens, easy to read on a phone.",
    locked: "Paid plans",
  },
  edit: {
    back: "All menus",
    shortLink: "Short link",
    publicPage: "Menu page",
    download: "Download QR code",
    settings: "Menu details",
    title: "Name",
    languages: "Languages",
    languagesHelp: "The first language is the default. Customers can switch on the menu page.",
    languagesLocked: "More languages are on the Business plan.",
    color: "Brand colour",
    phone: "Phone number for the call button",
    whatsapp: "WhatsApp number (international, e.g. 212612345678)",
    hours: "Opening hours",
    closed: "Closed",
    opens: "Opens",
    closes: "Closes",
    save: "Save details",
    saved: "Saved.",
    builderLocked:
      "Your plan no longer includes the menu builder. Customers still see this menu exactly as it is; to edit it, upgrade or switch to an uploaded file.",
  },
  upload: {
    heading: "Menu file",
    help: "PDF, JPG, PNG or WebP, up to 10 MB. Photos are resized in your browser before upload.",
    choose: "Upload a file",
    uploading: "Uploading…",
    current: "Current file",
    replace: "Replace file",
    done: "Uploaded. Customers see the new file right away.",
  },
  builder: {
    heading: "Menu",
    addSection: "Add section",
    sectionTitle: "Section title",
    addItem: "Add dish",
    itemName: "Dish",
    description: "Description",
    price: "Price",
    photo: "Photo",
    removePhoto: "Remove photo",
    allergens: "Allergens",
    remove: "Remove",
    up: "Move up",
    down: "Move down",
    save: "Save menu",
    saving: "Saving…",
    saved: "Saved. Customers see the new menu right away.",
    unsaved: "Unsaved changes",
  },
  pack: {
    heading: "Table cards and stickers",
    intro: "A PDF with a counter stand, a folding table tent and a window sticker, each tracked separately.",
    generate: "Download print pack (PDF)",
    generating: "Building your PDF…",
    failed: "The PDF could not be built. Please try again.",
  },
  print: { headline: "Our menu", subline: "Scan to see the menu", scanHint: "Scan with your phone camera", fold: "Fold here" },
  days: { mon: "Monday", tue: "Tuesday", wed: "Wednesday", thu: "Thursday", fri: "Friday", sat: "Saturday", sun: "Sunday" },
  langNames: LANG_NAMES,
  allergens: {
    gluten: "Gluten",
    crustaceans: "Crustaceans",
    eggs: "Eggs",
    fish: "Fish",
    peanuts: "Peanuts",
    soy: "Soy",
    milk: "Milk",
    nuts: "Tree nuts",
    celery: "Celery",
    mustard: "Mustard",
    sesame: "Sesame",
    sulphites: "Sulphites",
    lupin: "Lupin",
    molluscs: "Molluscs",
  },
  errors: {
    menuLimit: "You have reached the menu limit on your plan.",
    builderLocked: "The menu builder is on paid plans. Free menus use an uploaded PDF or image.",
    languages: "Choose languages your plan allows.",
    phone: "Enter a phone number with digits only, optionally starting with +.",
    whatsapp: "Enter the WhatsApp number in international format, digits only.",
    file: "Use a PDF, JPG, PNG or WebP file.",
    fileSize: "Files can be up to 10 MB.",
    menuInvalid: "The menu could not be saved. Check that it is not too long.",
  },
};

const fr: MenuStrings = {
  nav: "Menus",
  metaTitle: "Menu QR | QR Evergreen",
  h1: "QR code menu",
  intro:
    "Envoyez votre menu en PDF ou en photo, ou créez-le ici. Le code imprimé ne change jamais : modifiez prix et plats quand vous voulez.",
  list: { empty: "Aucun menu pour l'instant.", open: "Ouvrir", file: "PDF ou image", builder: "Créé ici" },
  create: {
    heading: "Nouveau menu",
    title: "Nom du restaurant ou du menu",
    titlePlaceholder: "Café Atlas",
    language: "Langue du menu",
    submit: "Créer le menu",
  },
  mode: {
    heading: "Ce que voient les clients",
    file: "PDF ou image envoyé",
    fileHelp: "Votre fichier de menu, affiché sur une page mobile avec vos horaires et boutons.",
    builder: "Menu créé ici",
    builderHelp: "Rubriques, plats, prix, photos et allergènes, faciles à lire sur téléphone.",
    locked: "Offres payantes",
  },
  edit: {
    back: "Tous les menus",
    shortLink: "Lien court",
    publicPage: "Page du menu",
    download: "Télécharger le QR code",
    settings: "Informations du menu",
    title: "Nom",
    languages: "Langues",
    languagesHelp: "La première langue est celle par défaut. Les clients peuvent changer sur la page du menu.",
    languagesLocked: "Plus de langues avec l'offre Business.",
    color: "Couleur de la marque",
    phone: "Numéro pour le bouton d'appel",
    whatsapp: "Numéro WhatsApp (international, ex. 212612345678)",
    hours: "Horaires d'ouverture",
    closed: "Fermé",
    opens: "Ouverture",
    closes: "Fermeture",
    save: "Enregistrer",
    saved: "Enregistré.",
    builderLocked:
      "Votre offre n'inclut plus l'éditeur de menu. Les clients voient toujours ce menu tel quel ; pour le modifier, changez d'offre ou passez à un fichier envoyé.",
  },
  upload: {
    heading: "Fichier du menu",
    help: "PDF, JPG, PNG ou WebP, 10 Mo maximum. Les photos sont réduites dans votre navigateur avant l'envoi.",
    choose: "Envoyer un fichier",
    uploading: "Envoi…",
    current: "Fichier actuel",
    replace: "Remplacer le fichier",
    done: "Envoyé. Les clients voient le nouveau fichier immédiatement.",
  },
  builder: {
    heading: "Menu",
    addSection: "Ajouter une rubrique",
    sectionTitle: "Titre de la rubrique",
    addItem: "Ajouter un plat",
    itemName: "Plat",
    description: "Description",
    price: "Prix",
    photo: "Photo",
    removePhoto: "Retirer la photo",
    allergens: "Allergènes",
    remove: "Supprimer",
    up: "Monter",
    down: "Descendre",
    save: "Enregistrer le menu",
    saving: "Enregistrement…",
    saved: "Enregistré. Les clients voient le nouveau menu immédiatement.",
    unsaved: "Modifications non enregistrées",
  },
  pack: {
    heading: "Chevalets et autocollants",
    intro: "Un PDF avec un présentoir de comptoir, un chevalet de table à plier et une vitrophanie, chacun suivi séparément.",
    generate: "Télécharger le kit (PDF)",
    generating: "Création du PDF…",
    failed: "Le PDF n'a pas pu être créé. Réessayez.",
  },
  print: { headline: "Notre menu", subline: "Scannez pour voir le menu", scanHint: "Scannez avec l'appareil photo", fold: "Pliez ici" },
  days: { mon: "Lundi", tue: "Mardi", wed: "Mercredi", thu: "Jeudi", fri: "Vendredi", sat: "Samedi", sun: "Dimanche" },
  langNames: LANG_NAMES,
  allergens: {
    gluten: "Gluten",
    crustaceans: "Crustacés",
    eggs: "Œufs",
    fish: "Poisson",
    peanuts: "Arachides",
    soy: "Soja",
    milk: "Lait",
    nuts: "Fruits à coque",
    celery: "Céleri",
    mustard: "Moutarde",
    sesame: "Sésame",
    sulphites: "Sulfites",
    lupin: "Lupin",
    molluscs: "Mollusques",
  },
  errors: {
    menuLimit: "Vous avez atteint la limite de menus de votre offre.",
    builderLocked: "L'éditeur de menu est réservé aux offres payantes. Les menus gratuits utilisent un PDF ou une image.",
    languages: "Choisissez des langues autorisées par votre offre.",
    phone: "Saisissez un numéro avec des chiffres uniquement, éventuellement précédé de +.",
    whatsapp: "Saisissez le numéro WhatsApp au format international, chiffres uniquement.",
    file: "Utilisez un fichier PDF, JPG, PNG ou WebP.",
    fileSize: "Les fichiers peuvent faire jusqu'à 10 Mo.",
    menuInvalid: "Le menu n'a pas pu être enregistré. Vérifiez qu'il n'est pas trop long.",
  },
};

export const MENU: Record<Locale, MenuStrings> = { en, fr };

// The public menu page, in every language a menu can use.
export type MenuPublicStrings = {
  call: string;
  whatsapp: string;
  hours: string;
  closed: string;
  openFile: string;
  language: string;
  allergens: string;
  empty: string;
  days: Record<Day, string>;
  allergenNames: Record<Allergen, string>;
};

export const MENU_PUBLIC: Record<MenuLang, MenuPublicStrings> = {
  en: {
    call: "Call",
    whatsapp: "WhatsApp",
    hours: "Opening hours",
    closed: "Closed",
    openFile: "Open the full menu",
    language: "Language",
    allergens: "Allergens",
    empty: "The menu is being updated. Please ask our staff.",
    days: en.days,
    allergenNames: en.allergens,
  },
  fr: {
    call: "Appeler",
    whatsapp: "WhatsApp",
    hours: "Horaires",
    closed: "Fermé",
    openFile: "Ouvrir le menu complet",
    language: "Langue",
    allergens: "Allergènes",
    empty: "Le menu est en cours de mise à jour. Demandez à notre équipe.",
    days: fr.days,
    allergenNames: fr.allergens,
  },
  ar: {
    call: "اتصال",
    whatsapp: "واتساب",
    hours: "ساعات العمل",
    closed: "مغلق",
    openFile: "افتح القائمة كاملة",
    language: "اللغة",
    allergens: "مسببات الحساسية",
    empty: "يتم تحديث القائمة. يرجى سؤال فريقنا.",
    days: { mon: "الإثنين", tue: "الثلاثاء", wed: "الأربعاء", thu: "الخميس", fri: "الجمعة", sat: "السبت", sun: "الأحد" },
    allergenNames: {
      gluten: "الغلوتين",
      crustaceans: "القشريات",
      eggs: "البيض",
      fish: "السمك",
      peanuts: "الفول السوداني",
      soy: "الصويا",
      milk: "الحليب",
      nuts: "المكسرات",
      celery: "الكرفس",
      mustard: "الخردل",
      sesame: "السمسم",
      sulphites: "الكبريتيت",
      lupin: "الترمس",
      molluscs: "الرخويات",
    },
  },
  es: {
    call: "Llamar",
    whatsapp: "WhatsApp",
    hours: "Horario",
    closed: "Cerrado",
    openFile: "Abrir el menú completo",
    language: "Idioma",
    allergens: "Alérgenos",
    empty: "Estamos actualizando el menú. Pregunte a nuestro equipo.",
    days: { mon: "Lunes", tue: "Martes", wed: "Miércoles", thu: "Jueves", fri: "Viernes", sat: "Sábado", sun: "Domingo" },
    allergenNames: {
      gluten: "Gluten",
      crustaceans: "Crustáceos",
      eggs: "Huevos",
      fish: "Pescado",
      peanuts: "Cacahuetes",
      soy: "Soja",
      milk: "Leche",
      nuts: "Frutos de cáscara",
      celery: "Apio",
      mustard: "Mostaza",
      sesame: "Sésamo",
      sulphites: "Sulfitos",
      lupin: "Altramuces",
      molluscs: "Moluscos",
    },
  },
};
