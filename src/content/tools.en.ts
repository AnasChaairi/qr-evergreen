import type { ToolContent } from "./types";
import type { CodeType } from "@/lib/qr/payloads";

export const toolsEn: Record<CodeType, ToolContent> = {
  wifi: {
    metaTitle: "Free WiFi QR Code Generator — No Expiry, No Sign-up",
    metaDescription:
      "Create a WiFi QR code so guests join your network without typing the password. Free, made in your browser, and it never expires.",
    h1: "WiFi QR code generator",
    intro:
      "Let guests join your WiFi by pointing their camera at a code. Enter your network name and password, pick a design, and download. The code is made in your browser and never expires.",
    upsell: "Coming soon: printable WiFi table cards with your logo, ready for cafés, rentals and offices.",
    sections: [
      {
        heading: "How to make a WiFi QR code",
        paragraphs: [
          "Type the network name exactly as it appears in your phone's WiFi list. Names are case-sensitive, so “CafeGuest” and “cafeguest” are different networks. Then enter the password and choose the security type. Almost every router made in the last ten years uses WPA2 or WPA3, which both work with the WPA option.",
          "If your network has no password, choose “No password”. If you hide the network name in your router settings, tick “Hidden network” so phones know to look for it.",
        ],
      },
      {
        heading: "How guests use it",
        paragraphs: [
          "On iPhone and Android the built-in camera reads WiFi codes. The guest points the camera at the code, taps the notification and the phone joins the network. Nobody has to read out a long password or squint at the back of a router.",
        ],
      },
      {
        heading: "Where to place the code",
        list: [
          "Café and restaurant tables, on a small table tent or sticker.",
          "The front desk or counter, next to the card machine.",
          "Holiday rentals and guest rooms, inside the welcome folder or on the fridge.",
          "Offices and meeting rooms, by the door or on the screen.",
        ],
      },
      {
        heading: "Print size and testing",
        paragraphs: [
          "Print the code at least 3 cm (about 1.2 inches) wide for scanning from arm's length, and larger if people will scan from further away. Keep a dark code on a light background. Before printing a batch, scan the code with two different phones to check it joins the right network.",
          "If you change your WiFi password, the old code stops working because the password is stored inside the pattern. Make a new code and reprint it. That is the honest trade-off of a static code: nothing on our side can break it, but nothing on our side can update it either.",
        ],
      },
    ],
    faq: [
      {
        q: "Is the WiFi password sent to your servers?",
        a: "No. The code is generated in your browser with JavaScript. Your network name and password never leave your device.",
      },
      {
        q: "Will this WiFi QR code expire?",
        a: "No. A WiFi code is static: the network details are stored inside the pattern itself. It keeps working as long as your network name and password stay the same, even if QR Evergreen disappears.",
      },
      {
        q: "Does it work on iPhone and Android?",
        a: "Yes. iPhones running iOS 11 or later and most Android phones from 2018 onwards read WiFi codes with the standard camera app.",
      },
      {
        q: "Can I add my logo?",
        a: "Yes. Upload a logo and we raise the error correction level so the code still scans with part of the pattern covered.",
      },
    ],
  },
  url: {
    metaTitle: "Free URL QR Code Generator — Link QR Codes That Never Expire",
    metaDescription:
      "Turn any link into a QR code with your colours, logo and a call to action. Free, no sign-up, no scan limit and no expiry.",
    h1: "URL and link QR code generator",
    intro:
      "Turn any web address into a QR code. Paste the link, style it with your colours and logo, and download it as PNG, SVG or PDF. No account, no scan limit, no expiry date.",
    upsell: "Coming soon: make the link editable after printing, so you can change where the code points without reprinting.",
    sections: [
      {
        heading: "How to make a link QR code",
        paragraphs: [
          "Paste the full address of the page you want to open. If you leave out “https://” we add it for you. Check the preview, choose colours that keep a dark code on a light background, and add a frame with a short call to action such as “Scan for the menu”.",
          "Shorter links make simpler patterns that scan faster and print smaller. If your address is very long, consider linking to a cleaner page on your own site.",
        ],
      },
      {
        heading: "Static links never expire",
        paragraphs: [
          "This generator makes a static code: the address is stored inside the pattern, with no redirect through our servers. That means it cannot be switched off, held hostage behind a subscription or broken if a company shuts down. Many “free” generators instead create a redirect link that stops working after a trial. Ours does not.",
          "The trade-off is that a static code always opens the same address. If the page might move, keep that address alive on your own site and redirect from there, or use an editable dynamic code.",
        ],
      },
      {
        heading: "Good uses for link codes",
        list: [
          "Flyers, posters and leaflets that point to a booking or event page.",
          "Product packaging and manuals that link to setup guides or videos.",
          "Business cards and shop windows that open your website or online shop.",
          "Restaurant tables that open an online menu.",
        ],
      },
      {
        heading: "Printing tips",
        paragraphs: [
          "A good rule is that the code should be at least one tenth of the scanning distance: about 2.5 cm for a business card, 10 cm for a poster read from a metre away. Use SVG or PDF for professional print shops, since they stay sharp at any size, and PNG for documents and social posts.",
        ],
      },
    ],
    faq: [
      {
        q: "Is there a limit on scans?",
        a: "No. A static code is read by the phone directly, so we never see or count the scans and there is nothing to limit.",
      },
      {
        q: "Can I change the link after printing?",
        a: "Not with a static code, because the address is inside the pattern. Editable dynamic codes are coming to QR Evergreen, and free dynamic codes will never be switched off.",
      },
      {
        q: "Which file format should I download?",
        a: "SVG or PDF for print, since they scale without blurring. PNG for websites, slides and documents.",
      },
      {
        q: "Do you add tracking or ads to my link?",
        a: "No. The code opens exactly the address you entered.",
      },
    ],
  },
  whatsapp: {
    metaTitle: "Free WhatsApp QR Code Generator — Chat With a Pre-filled Message",
    metaDescription:
      "Create a WhatsApp QR code that opens a chat with your number and a ready-written message. Free, no sign-up, never expires.",
    h1: "WhatsApp QR code generator",
    intro:
      "Let customers start a WhatsApp chat with you in one scan. Enter your number with its country code, add a pre-filled message if you like, and download a code that never expires.",
    upsell: "Coming soon: see how many people scan your WhatsApp code, by day and by printed item.",
    sections: [
      {
        heading: "How to make a WhatsApp QR code",
        paragraphs: [
          "Enter your WhatsApp number in full international format, starting with the country code: +33 for France, +212 for Morocco, +1 for the USA and Canada, +32 for Belgium. Leave out the leading zero of the local number. Spaces and dashes are fine; we remove them.",
          "Add a pre-filled message to save customers typing and to tell you where they came from, for example “Hello, I saw your poster and would like a quote”. The customer can still edit the message before sending it.",
        ],
      },
      {
        heading: "What happens when someone scans",
        paragraphs: [
          "The code opens an official wa.me link. WhatsApp starts a chat with your number and places your message in the text box. If the person does not have WhatsApp installed, they see a page inviting them to download it.",
        ],
      },
      {
        heading: "Where businesses use WhatsApp codes",
        list: [
          "Shop counters and windows, for orders and opening-hour questions.",
          "Restaurant tables and takeaway bags, for reservations and delivery orders.",
          "Salons and clinics, for booking appointments.",
          "Business cards, flyers and vehicle signage.",
        ],
      },
      {
        heading: "Tips for a code people actually scan",
        paragraphs: [
          "Add a frame with a clear call to action such as “Chat with us on WhatsApp”. People scan when they know what they will get. Test the code on your own phone before printing, and use a WhatsApp Business account if you want automatic greeting messages and labels for incoming chats.",
        ],
      },
    ],
    faq: [
      {
        q: "Do I need WhatsApp Business?",
        a: "No. The code works with personal and Business accounts. Business accounts add quick replies, labels and away messages, which help if you get many chats.",
      },
      {
        q: "Does the code expire?",
        a: "No. Your number and message are stored inside the pattern. The code works as long as the number is on WhatsApp.",
      },
      {
        q: "Why does the code not open my chat?",
        a: "Usually the number is missing its country code or still has a leading zero. Use the full international format, for example +33 6 12 34 56 78.",
      },
      {
        q: "Is my phone number stored by QR Evergreen?",
        a: "No. The code is generated in your browser and the number is never sent to us.",
      },
    ],
  },
  review: {
    metaTitle: "Free Google Review QR Code Generator — Get More Reviews",
    metaDescription:
      "Create a QR code that opens your Google review form in one scan. Free for local businesses, no sign-up, never expires.",
    h1: "Google review QR code generator",
    intro:
      "Make it easy for happy customers to leave a Google review. Paste your review link or Place ID, add your logo and a “Leave a review” frame, and print it for your counter, tables or receipts.",
    upsell: "Coming soon: a printable stand pack with your logo, including a counter stand, table tent, window sticker and receipt card.",
    sections: [
      {
        heading: "How to find your Google review link",
        paragraphs: [
          "The simplest way is from your Google Business Profile. Search for your business on Google while signed in as the owner, choose “Ask for reviews” (or “Get more reviews”) and copy the link it shows. It usually looks like g.page/r/…/review.",
          "You can also use your Place ID, a code that starts with “ChIJ”. Look it up with Google's Place ID Finder, paste it here, and we build the direct link to your review form.",
        ],
      },
      {
        heading: "Ask everyone, not only happy customers",
        paragraphs: [
          "Google's policy forbids review gating: filtering customers so only satisfied ones are asked to post a review. Every customer who scans this code goes straight to the same Google review form. Ask all customers in the same way and you stay within the rules.",
          "Google also forbids offering discounts, gifts or other rewards in exchange for reviews. Keep the message on your stand simple: “Enjoyed your visit? Leave us a review.”",
        ],
      },
      {
        heading: "Where to place a review code",
        list: [
          "The counter or till, where customers wait for their receipt.",
          "Restaurant tables, on a table tent next to the menu.",
          "Receipts, invoices and takeaway bags.",
          "Staff badges, for salons, clinics and hotels.",
        ],
      },
      {
        heading: "When to ask",
        paragraphs: [
          "The best moment is right after a good experience: when the meal is cleared, the haircut is finished or the order is handed over. A short spoken prompt from staff, together with a visible code, works far better than a code on its own.",
        ],
      },
    ],
    faq: [
      {
        q: "Is this an official Google product?",
        a: "No. QR Evergreen is an independent tool. The code opens Google's own review form for your business.",
      },
      {
        q: "Will the code stop working?",
        a: "No. It is a static code that opens your review link directly. It keeps working as long as your Business Profile exists.",
      },
      {
        q: "Can I add TripAdvisor or Trustpilot too?",
        a: "This free code opens one link. The upcoming review kit will offer a single page with Google plus optional TripAdvisor, Facebook, Trustpilot and Booking links.",
      },
      {
        q: "Can I offer a discount for a review?",
        a: "No. Google's policy forbids rewards for reviews, and businesses can lose reviews for it. Our templates never mention incentives.",
      },
    ],
  },
  vcard: {
    metaTitle: "Free vCard QR Code Generator — Contact QR for Business Cards",
    metaDescription:
      "Create a vCard QR code that saves your name, phone, email and address to any phone. Free, private, never expires.",
    h1: "vCard contact QR code generator",
    intro:
      "Put your contact details in a QR code that saves straight to the phone's address book. Ideal for business cards, email signatures and trade-show badges. Made in your browser, free forever.",
    upsell: "Coming soon: a hosted digital business card with your photo and buttons, which you can update without reprinting.",
    sections: [
      {
        heading: "How to make a contact QR code",
        paragraphs: [
          "Fill in the details you want to share. Only a name or a company is required; every other field is optional. Use the international format for your phone number, such as +212 6 00 00 00 00, so it works for people abroad.",
          "Each field you add makes the pattern denser. For a small business card, share the essentials (name, phone, email and website) and keep the code at least 2.5 cm wide.",
        ],
      },
      {
        heading: "What happens when someone scans",
        paragraphs: [
          "The phone recognises the vCard format and offers to create a new contact with your details already filled in. The person taps “Save” and you are in their address book, spelled correctly, with the right number.",
        ],
      },
      {
        heading: "Where to use a vCard code",
        list: [
          "The back of business cards.",
          "Trade-show badges and conference name tags.",
          "Email signatures and PDF proposals.",
          "Reception desks and shop counters.",
        ],
      },
      {
        heading: "Keeping your details current",
        paragraphs: [
          "A static vCard stores your details inside the pattern, so it never expires and works offline. If your number or job changes, make a new code. If you expect frequent changes, a hosted business card page, which you can edit after printing, may suit you better.",
        ],
      },
    ],
    faq: [
      {
        q: "Which phones can read vCard codes?",
        a: "Modern iPhones and Android phones read vCard codes with the camera app and offer to save the contact.",
      },
      {
        q: "Are my contact details stored online?",
        a: "No. The code is created in your browser. Your details are only inside the code you download.",
      },
      {
        q: "Can I add a photo?",
        a: "Photos make the code too large to scan reliably. The upcoming hosted business card will include a photo.",
      },
      {
        q: "Does the code expire?",
        a: "Never. It is static, with no link to our servers.",
      },
    ],
  },
};
