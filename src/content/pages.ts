import type { Locale } from "@/lib/i18n";
import type { HomeContent, InfoPageContent } from "./types";

export const CONTACT_EMAIL = "hello@qrevergreen.com";

export const HOME: Record<Locale, HomeContent> = {
  en: {
    metaTitle: "Free QR Code Generator — No Expiration, No Sign-up | QR Evergreen",
    metaDescription:
      "Make free QR codes for WiFi, links, WhatsApp, Google reviews and contact cards. No sign-up, no scan limit, and they never expire.",
    h1: "Free QR codes for your business, ready in a minute",
    intro:
      "Pick what the code should open, type it in, and download. Codes for WiFi, links, WhatsApp, Google reviews and contact cards keep working forever, even on printed menus and signs.",
    toolsHeading: "Free QR code tools",
    toolBlurbs: {
      wifi: "Guests join your network without typing the password.",
      url: "Open any website, menu or booking page.",
      whatsapp: "Start a chat with a pre-filled message.",
      review: "Send customers straight to your Google review form.",
      vcard: "Save your contact details to any phone.",
    },
    promiseHeading: "Our promise",
    promisePoints: [
      {
        title: "Free codes never expire",
        body: "Static codes store their data inside the pattern. They work even if this site disappears.",
      },
      {
        title: "No trial trap",
        body: "Many generators switch “free” codes off after 7 to 14 days and ask for $35 a month. We never will.",
      },
      {
        title: "Private by design",
        body: "Codes are drawn in your browser. What you type is not sent to our servers.",
      },
    ],
    badge: "Free forever. No sign-up needed.",
    trust: ["Never expires", "Unlimited scans", "Made on your device, stays private"],
    business: {
      heading: "Made for cafés, shops and salons",
      intro: "With a free account you can change where a printed code goes, and see how many people scan it.",
      cta: "Create a free account",
      cards: [
        {
          tag: "Review kit",
          title: "Get more Google reviews",
          body: "Find your business, pick a design and print table cards and counter stickers that open your review form.",
          cta: "Make a review kit",
          href: "review-kits",
        },
        {
          tag: "Menu QR",
          title: "Put your menu on every table",
          body: "Upload a photo or PDF of your menu, or build one with prices and photos. Change it any day; the printed code stays the same.",
          cta: "Make a menu QR",
          href: "menus",
        },
        {
          tag: "Editable codes",
          title: "See how many people scan",
          body: "Change the link behind a printed code and count scans by day. Free editable codes never expire.",
          cta: "Start free",
          href: "codes",
        },
      ],
    },
    faq: [
      {
        q: "Are these QR codes really free?",
        a: "Yes. Static codes are free to create, download and print, with no scan limit and no expiry. We earn from ads on these pages and, later, from optional business features.",
      },
      {
        q: "Why did my QR code from another site stop working?",
        a: "Many sites create a redirect link instead of a static code, then switch it off when a trial ends. Codes made here store the data directly in the pattern, so there is nothing to switch off.",
      },
      {
        q: "Can I use the codes commercially?",
        a: "Yes. Use them on menus, packaging, flyers, signs and anything else.",
      },
    ],
  },
  fr: {
    metaTitle: "Générateur de QR code gratuit — sans expiration ni inscription | QR Evergreen",
    metaDescription:
      "Créez des QR codes gratuits pour le WiFi, un lien, WhatsApp, les avis Google et les cartes de contact. Sans inscription, sans limite, sans expiration.",
    h1: "Des QR codes gratuits pour votre commerce, prêts en une minute",
    intro:
      "Choisissez ce que le code doit ouvrir, remplissez, téléchargez. WiFi, lien, WhatsApp, avis Google ou carte de contact : vos codes fonctionnent pour toujours, même imprimés sur vos menus et vitrines.",
    toolsHeading: "Outils QR code gratuits",
    toolBlurbs: {
      wifi: "Vos clients se connectent sans taper le mot de passe.",
      url: "Ouvrez un site, un menu ou une page de réservation.",
      whatsapp: "Démarrez une discussion avec un message pré-rempli.",
      review: "Envoyez vos clients sur votre formulaire d'avis Google.",
      vcard: "Enregistrez vos coordonnées sur n'importe quel téléphone.",
    },
    promiseHeading: "Notre promesse",
    promisePoints: [
      {
        title: "Les codes gratuits n'expirent jamais",
        body: "Un code statique contient ses données dans le motif. Il fonctionne même si ce site disparaît.",
      },
      {
        title: "Pas de piège à l'essai",
        body: "Beaucoup de générateurs désactivent les codes « gratuits » après 7 à 14 jours puis demandent 35 $ par mois. Jamais chez nous.",
      },
      {
        title: "Privé par conception",
        body: "Les codes sont dessinés dans votre navigateur. Ce que vous tapez n'est pas envoyé à nos serveurs.",
      },
    ],
    badge: "Gratuit pour toujours. Sans inscription.",
    trust: ["N'expire jamais", "Scans illimités", "Créé sur votre appareil, reste privé"],
    business: {
      heading: "Pensé pour les cafés, boutiques et salons",
      intro: "Avec un compte gratuit, changez la destination d'un code déjà imprimé et voyez combien de personnes le scannent.",
      cta: "Créer un compte gratuit",
      cards: [
        {
          tag: "Kit avis",
          title: "Obtenez plus d'avis Google",
          body: "Trouvez votre commerce, choisissez un design et imprimez chevalets et autocollants qui ouvrent votre formulaire d'avis.",
          cta: "Créer un kit avis",
          href: "review-kits",
        },
        {
          tag: "Menu QR",
          title: "Votre menu sur chaque table",
          body: "Envoyez une photo ou un PDF de votre menu, ou créez-le avec prix et photos. Modifiez-le quand vous voulez ; le code imprimé ne change pas.",
          cta: "Créer un menu QR",
          href: "menus",
        },
        {
          tag: "Codes modifiables",
          title: "Voyez combien de personnes scannent",
          body: "Changez le lien derrière un code imprimé et comptez les scans par jour. Les codes modifiables gratuits n'expirent jamais.",
          cta: "Commencer gratuitement",
          href: "codes",
        },
      ],
    },
    faq: [
      {
        q: "Ces QR codes sont-ils vraiment gratuits ?",
        a: "Oui. Les codes statiques sont gratuits à créer, télécharger et imprimer, sans limite de scans ni expiration. Nous vivons de la publicité sur ces pages et, plus tard, de fonctions optionnelles pour les entreprises.",
      },
      {
        q: "Pourquoi mon QR code d'un autre site ne fonctionne plus ?",
        a: "Beaucoup de sites créent un lien de redirection au lieu d'un code statique, puis le coupent à la fin de l'essai. Ici, les données sont directement dans le motif : il n'y a rien à couper.",
      },
      {
        q: "Puis-je utiliser les codes à des fins commerciales ?",
        a: "Oui. Menus, emballages, flyers, enseignes : utilisez-les partout.",
      },
    ],
  },
};

type InfoId = "privacy" | "terms" | "about" | "contact";

export const INFO_PAGES: Record<Locale, Record<InfoId, InfoPageContent>> = {
  en: {
    privacy: {
      metaTitle: "Privacy policy | QR Evergreen",
      metaDescription: "How QR Evergreen handles your data: free codes are made in your browser and never sent to us.",
      h1: "Privacy policy",
      updated: "Last updated: 23 October 2026",
      sections: [
        {
          heading: "The short version",
          paragraphs: [
            "Free QR codes are created entirely in your browser. The text, passwords, phone numbers and logos you enter are not sent to our servers and we do not store them.",
          ],
        },
        {
          heading: "What we collect",
          list: [
            "Anonymous site statistics (pages viewed, country, device type) through a privacy-friendly analytics tool that does not use cookies or store IP addresses.",
            "If ads are shown, our advertising partner (Google AdSense) may use cookies to show and measure ads. Where required by law we ask for your consent first.",
            "If you email us, we keep your message and email address to reply.",
          ],
        },
        {
          heading: "Your rights",
          paragraphs: [
            "Under the GDPR and Moroccan law 09-08 you can ask to access, correct or delete personal data we hold about you. Write to us at the address on our contact page.",
          ],
        },
        {
          heading: "Changes",
          paragraphs: [
            "When accounts and paid features launch, this policy will be updated to describe the extra data they need, such as your email address and scan statistics for dynamic codes.",
          ],
        },
      ],
    },
    terms: {
      metaTitle: "Terms of use | QR Evergreen",
      metaDescription: "The terms for using QR Evergreen's free QR code tools.",
      h1: "Terms of use",
      updated: "Last updated: 23 October 2026",
      sections: [
        {
          heading: "Using the free tools",
          paragraphs: [
            "You may create, download and use static QR codes for any lawful personal or commercial purpose, free of charge. You own the codes you create.",
          ],
        },
        {
          heading: "Acceptable use",
          paragraphs: [
            "Do not use QR Evergreen to create codes that point to phishing, malware, scams or other illegal content.",
          ],
        },
        {
          heading: "No warranty",
          paragraphs: [
            "The tools are provided as they are. Always test a code with more than one phone before printing it in quantity. We are not liable for printing costs or losses caused by codes that were not tested.",
          ],
        },
        {
          heading: "Our promise on static codes",
          paragraphs: [
            "Static codes do not depend on our servers. They keep working whether or not QR Evergreen exists.",
          ],
        },
      ],
    },
    about: {
      metaTitle: "About | QR Evergreen",
      metaDescription: "Why QR Evergreen exists: honest QR codes that never get switched off.",
      h1: "About QR Evergreen",
      sections: [
        {
          heading: "Why we built it",
          paragraphs: [
            "Too many small businesses print menus, flyers and stickers with a “free” QR code, only to find it switched off after a short trial and held behind a $35 monthly fee. QR Evergreen exists to fix that.",
            "Our free codes are static and never expire. When we add paid features for businesses, such as editable codes, review kits and menus, codes will keep working even if a subscription ends.",
          ],
        },
        {
          heading: "How we make money",
          paragraphs: [
            "Free tool pages show a small number of ads, never between you and the download button. Paid plans for businesses are coming soon.",
          ],
        },
      ],
    },
    contact: {
      metaTitle: "Contact | QR Evergreen",
      metaDescription: "Get in touch with QR Evergreen.",
      h1: "Contact",
      sections: [
        {
          heading: "Write to us",
          paragraphs: [
            `Questions, ideas or a code that does not scan? Email ${CONTACT_EMAIL} and we will reply within two working days.`,
            "To report a QR code that leads to a scam or harmful site, email us with the link and we will look into it quickly.",
          ],
        },
      ],
    },
  },
  fr: {
    privacy: {
      metaTitle: "Politique de confidentialité | QR Evergreen",
      metaDescription:
        "Comment QR Evergreen traite vos données : les codes gratuits sont créés dans votre navigateur et ne nous sont jamais envoyés.",
      h1: "Politique de confidentialité",
      updated: "Dernière mise à jour : 23 octobre 2026",
      sections: [
        {
          heading: "En bref",
          paragraphs: [
            "Les QR codes gratuits sont créés entièrement dans votre navigateur. Les textes, mots de passe, numéros et logos saisis ne sont pas envoyés à nos serveurs et nous ne les conservons pas.",
          ],
        },
        {
          heading: "Ce que nous collectons",
          list: [
            "Des statistiques anonymes (pages vues, pays, type d'appareil) via un outil de mesure respectueux de la vie privée, sans cookie ni adresse IP conservée.",
            "Si des publicités sont affichées, notre partenaire publicitaire (Google AdSense) peut utiliser des cookies pour diffuser et mesurer les annonces. Lorsque la loi l'exige, nous demandons d'abord votre consentement.",
            "Si vous nous écrivez, nous conservons votre message et votre adresse e-mail pour vous répondre.",
          ],
        },
        {
          heading: "Vos droits",
          paragraphs: [
            "Conformément au RGPD et à la loi marocaine 09-08, vous pouvez demander l'accès, la rectification ou la suppression de vos données personnelles. Écrivez-nous à l'adresse indiquée sur la page contact.",
          ],
        },
        {
          heading: "Évolutions",
          paragraphs: [
            "Lors du lancement des comptes et des offres payantes, cette politique sera mise à jour pour décrire les données supplémentaires nécessaires, comme votre e-mail et les statistiques de scan des codes dynamiques.",
          ],
        },
      ],
    },
    terms: {
      metaTitle: "Conditions d'utilisation | QR Evergreen",
      metaDescription: "Les conditions d'utilisation des outils QR code gratuits de QR Evergreen.",
      h1: "Conditions d'utilisation",
      updated: "Dernière mise à jour : 23 octobre 2026",
      sections: [
        {
          heading: "Utilisation des outils gratuits",
          paragraphs: [
            "Vous pouvez créer, télécharger et utiliser gratuitement des QR codes statiques à toute fin licite, personnelle ou commerciale. Les codes que vous créez vous appartiennent.",
          ],
        },
        {
          heading: "Usage acceptable",
          paragraphs: [
            "N'utilisez pas QR Evergreen pour créer des codes menant à de l'hameçonnage, des logiciels malveillants, des arnaques ou tout autre contenu illégal.",
          ],
        },
        {
          heading: "Absence de garantie",
          paragraphs: [
            "Les outils sont fournis en l'état. Testez toujours un code avec plusieurs téléphones avant de l'imprimer en quantité. Nous ne sommes pas responsables des frais d'impression ou pertes liés à des codes non testés.",
          ],
        },
        {
          heading: "Notre promesse sur les codes statiques",
          paragraphs: [
            "Les codes statiques ne dépendent pas de nos serveurs. Ils continuent de fonctionner, que QR Evergreen existe ou non.",
          ],
        },
      ],
    },
    about: {
      metaTitle: "À propos | QR Evergreen",
      metaDescription: "Pourquoi QR Evergreen existe : des QR codes honnêtes qui ne sont jamais désactivés.",
      h1: "À propos de QR Evergreen",
      sections: [
        {
          heading: "Pourquoi nous l'avons créé",
          paragraphs: [
            "Trop de petits commerces impriment menus, flyers et autocollants avec un QR code « gratuit », puis découvrent qu'il a été désactivé après un court essai et qu'il faut payer 35 $ par mois pour le réactiver. QR Evergreen existe pour mettre fin à cela.",
            "Nos codes gratuits sont statiques et n'expirent jamais. Lorsque nous ajouterons des offres payantes pour les entreprises (codes modifiables, kits avis, menus), les codes continueront de fonctionner même si l'abonnement s'arrête.",
          ],
        },
        {
          heading: "Comment nous gagnons de l'argent",
          paragraphs: [
            "Les pages d'outils gratuits affichent quelques publicités, jamais entre vous et le bouton de téléchargement. Des offres payantes pour les entreprises arrivent bientôt.",
          ],
        },
      ],
    },
    contact: {
      metaTitle: "Contact | QR Evergreen",
      metaDescription: "Contactez QR Evergreen.",
      h1: "Contact",
      sections: [
        {
          heading: "Écrivez-nous",
          paragraphs: [
            `Une question, une idée ou un code qui ne se scanne pas ? Écrivez à ${CONTACT_EMAIL}, nous répondons sous deux jours ouvrés.`,
            "Pour signaler un QR code menant à une arnaque ou à un site dangereux, envoyez-nous le lien et nous l'examinerons rapidement.",
          ],
        },
      ],
    },
  },
};
