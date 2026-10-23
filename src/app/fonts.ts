import { Bricolage_Grotesque, DM_Sans, IBM_Plex_Sans_Arabic } from "next/font/google";

// Friendly display face for headings, a clear body face, and an Arabic face
// for right-to-left menus.
const display = Bricolage_Grotesque({ variable: "--font-display-face", subsets: ["latin"], weight: ["600", "700", "800"] });
const body = DM_Sans({ variable: "--font-body", subsets: ["latin"] });
const arabic = IBM_Plex_Sans_Arabic({ variable: "--font-arabic-face", subsets: ["arabic"], weight: ["400", "500", "600", "700"] });

export const fontVariables = `${display.variable} ${body.variable} ${arabic.variable}`;
