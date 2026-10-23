import type { ToolContent } from "./types";
import type { CodeType } from "@/lib/qr/payloads";

export const toolsFr: Record<CodeType, ToolContent> = {
  wifi: {
    metaTitle: "Générateur de QR code WiFi gratuit — sans expiration ni inscription",
    metaDescription:
      "Créez un QR code WiFi pour que vos clients se connectent sans taper le mot de passe. Gratuit, créé dans votre navigateur, sans expiration.",
    h1: "Générateur de QR code WiFi",
    intro:
      "Vos clients se connectent à votre WiFi en scannant un code avec leur appareil photo. Saisissez le nom du réseau et le mot de passe, choisissez un style et téléchargez. Le code est créé dans votre navigateur et n'expire jamais.",
    upsell: "Bientôt : des chevalets WiFi imprimables avec votre logo, pour cafés, locations et bureaux.",
    sections: [
      {
        heading: "Comment créer un QR code WiFi",
        paragraphs: [
          "Tapez le nom du réseau exactement comme il apparaît dans la liste WiFi de votre téléphone. Les majuscules comptent : « CafeInvite » et « cafeinvite » sont deux réseaux différents. Saisissez ensuite le mot de passe et le type de sécurité. Presque toutes les box récentes utilisent WPA2 ou WPA3, qui fonctionnent tous deux avec l'option WPA.",
          "Si votre réseau n'a pas de mot de passe, choisissez « Sans mot de passe ». Si vous avez masqué le nom du réseau dans les réglages de votre box, cochez « Réseau masqué ».",
        ],
      },
      {
        heading: "Comment vos clients l'utilisent",
        paragraphs: [
          "Sur iPhone comme sur Android, l'appareil photo lit les QR codes WiFi. Le client vise le code, touche la notification et le téléphone se connecte. Plus besoin d'épeler un long mot de passe ou de retourner la box.",
        ],
      },
      {
        heading: "Où placer le code",
        list: [
          "Sur les tables d'un café ou d'un restaurant, avec un petit chevalet ou un autocollant.",
          "À l'accueil ou au comptoir, à côté du terminal de paiement.",
          "Dans les locations de vacances et les chambres d'hôtes, dans le livret d'accueil.",
          "Dans les bureaux et salles de réunion, près de la porte ou sur l'écran.",
        ],
      },
      {
        heading: "Taille d'impression et test",
        paragraphs: [
          "Imprimez le code sur au moins 3 cm de large pour un scan à bout de bras, et plus grand si on le scanne de plus loin. Gardez un code foncé sur un fond clair. Avant d'imprimer en série, testez le code avec deux téléphones différents.",
          "Si vous changez le mot de passe WiFi, l'ancien code ne fonctionne plus, car le mot de passe est enregistré dans le motif. Créez un nouveau code et réimprimez-le. C'est le compromis honnête d'un code statique : rien de notre côté ne peut le casser, mais rien ne peut non plus le mettre à jour.",
        ],
      },
    ],
    faq: [
      {
        q: "Le mot de passe WiFi est-il envoyé à vos serveurs ?",
        a: "Non. Le code est généré dans votre navigateur. Le nom du réseau et le mot de passe ne quittent jamais votre appareil.",
      },
      {
        q: "Ce QR code WiFi va-t-il expirer ?",
        a: "Non. Un code WiFi est statique : les informations du réseau sont dans le motif. Il fonctionne tant que le nom du réseau et le mot de passe ne changent pas, même si QR Evergreen disparaît.",
      },
      {
        q: "Est-ce que ça marche sur iPhone et Android ?",
        a: "Oui. Les iPhone sous iOS 11 ou plus récent et la plupart des téléphones Android depuis 2018 lisent les codes WiFi avec l'appareil photo.",
      },
      {
        q: "Puis-je ajouter mon logo ?",
        a: "Oui. Ajoutez un logo et nous augmentons le niveau de correction d'erreur pour que le code reste lisible.",
      },
    ],
  },
  url: {
    metaTitle: "Générateur de QR code pour lien gratuit — sans expiration",
    metaDescription:
      "Transformez n'importe quel lien en QR code avec vos couleurs, votre logo et un appel à l'action. Gratuit, sans inscription, sans limite de scans.",
    h1: "Générateur de QR code pour lien (URL)",
    intro:
      "Transformez une adresse web en QR code. Collez le lien, personnalisez les couleurs et le logo, puis téléchargez en PNG, SVG ou PDF. Sans compte, sans limite de scans, sans date d'expiration.",
    upsell: "Bientôt : rendez le lien modifiable après impression, pour changer la destination sans réimprimer.",
    sections: [
      {
        heading: "Comment créer un QR code pour un lien",
        paragraphs: [
          "Collez l'adresse complète de la page à ouvrir. Si vous oubliez « https:// », nous l'ajoutons. Vérifiez l'aperçu, choisissez des couleurs qui gardent un code foncé sur fond clair, et ajoutez un cadre avec un appel à l'action court comme « Scannez pour le menu ».",
          "Un lien court donne un motif plus simple, qui se scanne plus vite et s'imprime plus petit. Si votre adresse est très longue, pointez plutôt vers une page plus simple de votre site.",
        ],
      },
      {
        heading: "Un lien statique n'expire jamais",
        paragraphs: [
          "Ce générateur crée un code statique : l'adresse est enregistrée dans le motif, sans redirection par nos serveurs. Il ne peut donc pas être désactivé, bloqué derrière un abonnement ou cassé si une entreprise ferme. Beaucoup de générateurs « gratuits » créent au contraire un lien de redirection qui s'arrête après l'essai. Pas le nôtre.",
          "La contrepartie : un code statique ouvre toujours la même adresse. Si la page peut changer, gardez cette adresse active sur votre site et redirigez depuis là, ou utilisez un code dynamique modifiable.",
        ],
      },
      {
        heading: "Bons usages des QR codes de lien",
        list: [
          "Flyers, affiches et prospectus vers une page de réservation ou d'événement.",
          "Emballages et notices vers un guide d'installation ou une vidéo.",
          "Cartes de visite et vitrines vers votre site ou votre boutique en ligne.",
          "Tables de restaurant vers un menu en ligne.",
        ],
      },
      {
        heading: "Conseils d'impression",
        paragraphs: [
          "Règle simple : le code doit mesurer au moins un dixième de la distance de scan, soit environ 2,5 cm sur une carte de visite et 10 cm sur une affiche lue à un mètre. Utilisez le SVG ou le PDF pour un imprimeur, car ils restent nets à toute taille, et le PNG pour les documents et réseaux sociaux.",
        ],
      },
    ],
    faq: [
      {
        q: "Y a-t-il une limite de scans ?",
        a: "Non. Un code statique est lu directement par le téléphone : nous ne voyons ni ne comptons les scans, il n'y a donc rien à limiter.",
      },
      {
        q: "Puis-je changer le lien après impression ?",
        a: "Pas avec un code statique, car l'adresse est dans le motif. Les codes dynamiques modifiables arrivent sur QR Evergreen, et les codes dynamiques gratuits ne seront jamais désactivés.",
      },
      {
        q: "Quel format télécharger ?",
        a: "SVG ou PDF pour l'impression, car ils s'agrandissent sans flou. PNG pour les sites web, présentations et documents.",
      },
      {
        q: "Ajoutez-vous du suivi ou de la publicité à mon lien ?",
        a: "Non. Le code ouvre exactement l'adresse que vous avez saisie.",
      },
    ],
  },
  whatsapp: {
    metaTitle: "Générateur de QR code WhatsApp gratuit — avec message pré-rempli",
    metaDescription:
      "Créez un QR code WhatsApp qui ouvre une discussion avec votre numéro et un message déjà rédigé. Gratuit, sans inscription, sans expiration.",
    h1: "Générateur de QR code WhatsApp",
    intro:
      "Vos clients vous écrivent sur WhatsApp en un scan. Saisissez votre numéro avec l'indicatif du pays, ajoutez un message pré-rempli si vous le souhaitez, et téléchargez un code qui n'expire jamais.",
    upsell: "Bientôt : voyez combien de personnes scannent votre code WhatsApp, par jour et par support imprimé.",
    sections: [
      {
        heading: "Comment créer un QR code WhatsApp",
        paragraphs: [
          "Saisissez votre numéro WhatsApp au format international, en commençant par l'indicatif : +33 pour la France, +32 pour la Belgique, +1 pour le Canada, +212 pour le Maroc, +221 pour le Sénégal. Retirez le zéro initial du numéro local. Les espaces et tirets ne posent pas de problème.",
          "Ajoutez un message pré-rempli pour éviter à vos clients de taper et savoir d'où ils viennent, par exemple « Bonjour, j'ai vu votre affiche et je voudrais un devis ». Le client peut modifier le message avant de l'envoyer.",
        ],
      },
      {
        heading: "Ce qui se passe au scan",
        paragraphs: [
          "Le code ouvre un lien officiel wa.me. WhatsApp démarre une discussion avec votre numéro et place votre message dans la zone de texte. Si la personne n'a pas WhatsApp, une page l'invite à l'installer.",
        ],
      },
      {
        heading: "Où les commerces utilisent un code WhatsApp",
        list: [
          "Comptoirs et vitrines, pour les commandes et les questions d'horaires.",
          "Tables et sacs à emporter, pour les réservations et la livraison.",
          "Salons et cabinets, pour la prise de rendez-vous.",
          "Cartes de visite, flyers et véhicules.",
        ],
      },
      {
        heading: "Pour un code qu'on scanne vraiment",
        paragraphs: [
          "Ajoutez un cadre avec un appel à l'action clair comme « Écrivez-nous sur WhatsApp » : on scanne quand on sait ce qu'on va obtenir. Testez le code avec votre téléphone avant d'imprimer, et utilisez WhatsApp Business si vous voulez des messages d'accueil automatiques et des étiquettes.",
        ],
      },
    ],
    faq: [
      {
        q: "Faut-il WhatsApp Business ?",
        a: "Non. Le code fonctionne avec un compte personnel ou Business. Le compte Business ajoute réponses rapides, étiquettes et messages d'absence.",
      },
      {
        q: "Le code expire-t-il ?",
        a: "Non. Le numéro et le message sont dans le motif. Le code fonctionne tant que le numéro est sur WhatsApp.",
      },
      {
        q: "Pourquoi le code n'ouvre-t-il pas ma discussion ?",
        a: "Le plus souvent, l'indicatif du pays manque ou le zéro initial est resté. Utilisez le format international complet, par exemple +33 6 12 34 56 78.",
      },
      {
        q: "QR Evergreen enregistre-t-il mon numéro ?",
        a: "Non. Le code est généré dans votre navigateur et le numéro ne nous est jamais envoyé.",
      },
    ],
  },
  review: {
    metaTitle: "Générateur de QR code avis Google gratuit — plus d'avis clients",
    metaDescription:
      "Créez un QR code qui ouvre votre formulaire d'avis Google en un scan. Gratuit pour les commerces, sans inscription, sans expiration.",
    h1: "Générateur de QR code pour avis Google",
    intro:
      "Facilitez les avis Google de vos clients satisfaits. Collez votre lien d'avis ou votre Place ID, ajoutez votre logo et un cadre « Laissez un avis », puis imprimez-le pour le comptoir, les tables ou les tickets.",
    upsell: "Bientôt : un kit imprimable avec votre logo (présentoir de comptoir, chevalet de table, vitrophanie et carte ticket).",
    sections: [
      {
        heading: "Trouver votre lien d'avis Google",
        paragraphs: [
          "Le plus simple passe par votre fiche Google Business Profile. Cherchez votre établissement sur Google en étant connecté comme propriétaire, choisissez « Demander des avis » et copiez le lien affiché. Il ressemble souvent à g.page/r/…/review.",
          "Vous pouvez aussi utiliser votre Place ID, un code qui commence par « ChIJ ». Trouvez-le avec l'outil Place ID Finder de Google, collez-le ici, et nous construisons le lien direct vers votre formulaire d'avis.",
        ],
      },
      {
        heading: "Sollicitez tout le monde, pas seulement les clients contents",
        paragraphs: [
          "Le règlement de Google interdit le « review gating » : filtrer les clients pour ne demander un avis qu'aux plus satisfaits. Chaque client qui scanne ce code arrive directement sur le même formulaire d'avis Google. Demandez à tous de la même façon et vous restez dans les règles.",
          "Google interdit aussi d'offrir réductions, cadeaux ou récompenses en échange d'un avis. Gardez un message simple : « Vous avez aimé votre visite ? Laissez-nous un avis. »",
        ],
      },
      {
        heading: "Où placer un code d'avis",
        list: [
          "Le comptoir ou la caisse, quand le client attend son ticket.",
          "Les tables d'un restaurant, sur un chevalet à côté du menu.",
          "Les tickets, factures et sacs à emporter.",
          "Les badges du personnel, en salon, cabinet ou hôtel.",
        ],
      },
      {
        heading: "Quand demander",
        paragraphs: [
          "Le meilleur moment est juste après une bonne expérience : quand on débarrasse la table, quand la coupe est terminée, quand on remet la commande. Une courte phrase du personnel associée à un code visible fonctionne bien mieux qu'un code seul.",
        ],
      },
    ],
    faq: [
      {
        q: "Est-ce un produit officiel de Google ?",
        a: "Non. QR Evergreen est un outil indépendant. Le code ouvre le formulaire d'avis de Google pour votre établissement.",
      },
      {
        q: "Le code va-t-il cesser de fonctionner ?",
        a: "Non. C'est un code statique qui ouvre directement votre lien d'avis. Il fonctionne tant que votre fiche existe.",
      },
      {
        q: "Puis-je ajouter TripAdvisor ou Trustpilot ?",
        a: "Ce code gratuit ouvre un seul lien. Le futur kit avis proposera une page unique avec Google et, au choix, TripAdvisor, Facebook, Trustpilot et Booking.",
      },
      {
        q: "Puis-je offrir une réduction contre un avis ?",
        a: "Non. Google l'interdit et un établissement peut perdre ses avis. Nos modèles ne mentionnent jamais de récompense.",
      },
    ],
  },
  vcard: {
    metaTitle: "Générateur de QR code vCard gratuit — contact pour carte de visite",
    metaDescription:
      "Créez un QR code vCard qui enregistre votre nom, téléphone, e-mail et adresse sur n'importe quel téléphone. Gratuit, privé, sans expiration.",
    h1: "Générateur de QR code vCard (contact)",
    intro:
      "Mettez vos coordonnées dans un QR code qui s'enregistre directement dans le carnet d'adresses. Idéal pour les cartes de visite, signatures e-mail et badges de salon. Créé dans votre navigateur, gratuit pour toujours.",
    upsell: "Bientôt : une carte de visite numérique avec photo et boutons, modifiable sans réimprimer.",
    sections: [
      {
        heading: "Comment créer un QR code contact",
        paragraphs: [
          "Remplissez les informations à partager. Seul un nom ou une entreprise est obligatoire. Utilisez le format international pour le téléphone, par exemple +33 6 12 34 56 78, pour que le numéro fonctionne depuis l'étranger.",
          "Chaque champ ajouté densifie le motif. Sur une petite carte de visite, partagez l'essentiel (nom, téléphone, e-mail, site) et gardez le code à au moins 2,5 cm de large.",
        ],
      },
      {
        heading: "Ce qui se passe au scan",
        paragraphs: [
          "Le téléphone reconnaît le format vCard et propose de créer un contact déjà rempli. La personne touche « Enregistrer » et vous voilà dans son carnet, sans faute de frappe, avec le bon numéro.",
        ],
      },
      {
        heading: "Où utiliser un code vCard",
        list: [
          "Au dos des cartes de visite.",
          "Sur les badges de salon et de conférence.",
          "Dans les signatures e-mail et les propositions en PDF.",
          "À l'accueil et au comptoir.",
        ],
      },
      {
        heading: "Garder vos coordonnées à jour",
        paragraphs: [
          "Une vCard statique enregistre vos coordonnées dans le motif : elle n'expire jamais et fonctionne hors ligne. Si votre numéro ou votre poste change, créez un nouveau code. Si vos informations changent souvent, une carte de visite en ligne modifiable après impression vous conviendra mieux.",
        ],
      },
    ],
    faq: [
      {
        q: "Quels téléphones lisent les codes vCard ?",
        a: "Les iPhone et téléphones Android récents lisent les codes vCard avec l'appareil photo et proposent d'enregistrer le contact.",
      },
      {
        q: "Mes coordonnées sont-elles stockées en ligne ?",
        a: "Non. Le code est créé dans votre navigateur. Vos informations sont uniquement dans le code téléchargé.",
      },
      {
        q: "Puis-je ajouter une photo ?",
        a: "Une photo rendrait le code trop dense pour être lu de façon fiable. La future carte de visite en ligne inclura une photo.",
      },
      {
        q: "Le code expire-t-il ?",
        a: "Jamais. Il est statique, sans lien avec nos serveurs.",
      },
    ],
  },
};
