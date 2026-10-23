import { readFileSync, writeFileSync } from "node:fs";
import { PDFDocument } from "pdf-lib";
import { describe, expect, it } from "vitest";
import { PRINT_DESIGNS } from "./kit";
import { buildPrintPackBytes, safeText } from "./printPack";

// A real 1x1 PNG stands in for the browser-rendered QR code and logo.
const PNG = Uint8Array.from(
  Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==", "base64"),
);
const deps = {
  qrPng: async () => (process.env.PACK_QR ? readFileSync(process.env.PACK_QR) : PNG).buffer as ArrayBuffer,
  logoPng: async () => PNG.buffer as ArrayBuffer,
};
const text = { headline: "Vous avez aimé votre visite ?", subline: "Laissez-nous un avis", scanHint: "Scannez avec l'appareil photo", fold: "Pliez ici" };

describe("print pack", () => {
  it.each(PRINT_DESIGNS)("builds five pages in the %s design", async (design) => {
    const bytes = await buildPrintPackBytes(
      { businessName: "Café Atlas — Rabat 🌿", shortUrl: "https://qrev.link/AbC1234", color: "#7c2d12", design, logo: null, text },
      deps,
    );
    if (process.env.PACK_OUT) writeFileSync(`${process.env.PACK_OUT}/pack-${design}.pdf`, bytes);
    const pdf = await PDFDocument.load(bytes);
    expect(pdf.getPageCount()).toBe(5);
    const [stand] = pdf.getPages();
    expect(Math.round(stand.getWidth())).toBe(298); // 105 mm
  });

  it("builds only the chosen items, without stars, for a menu pack", async () => {
    const bytes = await buildPrintPackBytes(
      {
        businessName: "Café Atlas",
        shortUrl: "https://qrev.link/AbC1234",
        color: "#166534",
        design: "classic",
        logo: null,
        text: { headline: "Notre menu", subline: "Scannez pour voir le menu", scanHint: "Scannez avec l'appareil photo", fold: "Pliez ici" },
        items: ["counter-stand", "table-tent", "window-sticker"],
        stars: false,
        documentTitle: "Café Atlas menu",
      },
      deps,
    );
    if (process.env.PACK_OUT) writeFileSync(`${process.env.PACK_OUT}/pack-menu.pdf`, bytes);
    const pdf = await PDFDocument.load(bytes);
    expect(pdf.getPageCount()).toBe(3);
    expect(pdf.getTitle()).toBe("Café Atlas menu");
  });

  it("drops characters the PDF font cannot draw", () => {
    const font = { encodeText: (c: string) => { if (c.codePointAt(0)! > 255) throw new Error("x"); return c; } };
    expect(safeText(font as never, "Café 🌿")).toBe("Café");
  });
});
