// Browser-only: builds a print pack (review kit or menu) as one PDF, one page per item.
// Each item's code carries its own ?s= tag so scans can be told apart.

import type { PDFDocument, PDFFont, PDFImage, PDFPage, RGB } from "pdf-lib";
import { DEFAULT_DESIGN, renderSvg, svgToPng } from "@/lib/qr/render";
import { PRINT_ITEMS, itemLink, type PrintDesign, type PrintItemId } from "./kit";

const MM = 72 / 25.4;

export type PackText = { headline: string; subline: string; scanHint: string; fold: string };

export type PackOptions = {
  businessName: string;
  shortUrl: string;
  color: string; // #rrggbb
  design: PrintDesign;
  logo: Blob | null;
  text: PackText;
  items?: readonly PrintItemId[]; // default: every item
  stars?: boolean; // review packs show five stars; default true
  documentTitle?: string;
};

type Assets = {
  pdfLib: typeof import("pdf-lib");
  bold: PDFFont;
  regular: PDFFont;
  logo: PDFImage | null;
};

// Image helpers are injectable so the layout can be tested outside a browser.
export type PackDeps = {
  qrPng: (url: string) => Promise<ArrayBuffer>;
  logoPng: (file: Blob) => Promise<ArrayBuffer>;
};

const browserDeps: PackDeps = { qrPng, logoPng: toPngBytes };

export async function buildPrintPack(options: PackOptions, deps: PackDeps = browserDeps): Promise<Blob> {
  const bytes = await buildPrintPackBytes(options, deps);
  return new Blob([bytes as BlobPart], { type: "application/pdf" });
}

export async function buildPrintPackBytes(options: PackOptions, deps: PackDeps): Promise<Uint8Array> {
  const pdfLib = await import("pdf-lib");
  const pdf = await pdfLib.PDFDocument.create();
  pdf.setTitle(options.documentTitle ?? `${options.businessName} review kit`);
  pdf.setCreator("QR Evergreen");
  const assets: Assets = {
    pdfLib,
    bold: await pdf.embedFont(pdfLib.StandardFonts.HelveticaBold),
    regular: await pdf.embedFont(pdfLib.StandardFonts.Helvetica),
    logo: options.logo ? await pdf.embedPng(await deps.logoPng(options.logo)) : null,
  };

  for (const item of PRINT_ITEMS.filter((i) => !options.items || options.items.includes(i.id))) {
    const width = item.widthMm * MM;
    const height = item.heightMm * MM;
    if (item.id === "table-tent") {
      await drawTableTent(pdf, width, height, options, assets, deps);
    } else {
      const qr = await pdf.embedPng(await deps.qrPng(itemLink(options.shortUrl, item.id)));
      drawFace(pdf.addPage([width, height]), width, height, qr, options, assets, item.id);
    }
  }

  return pdf.save();
}

async function qrPng(url: string): Promise<ArrayBuffer> {
  const svg = await renderSvg(url, { ...DEFAULT_DESIGN, foreground: "#111827", background: "#ffffff" });
  return (await svgToPng(svg, 1200)).arrayBuffer();
}

// Any browser-readable image (PNG, JPEG, SVG, WebP) becomes PNG bytes for pdf-lib.
async function toPngBytes(file: Blob): Promise<ArrayBuffer> {
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    const scale = Math.min(1, 800 / Math.max(image.naturalWidth || 800, image.naturalHeight || 800));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round((image.naturalWidth || 800) * scale));
    canvas.height = Math.max(1, Math.round((image.naturalHeight || 800) * scale));
    canvas.getContext("2d")!.drawImage(image, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Logo conversion failed"))), "image/png"),
    );
    return blob.arrayBuffer();
  } finally {
    URL.revokeObjectURL(url);
  }
}

// A5 sheet: the same face twice, the top one upside down, so it stands as a tent.
async function drawTableTent(pdf: PDFDocument, width: number, height: number, options: PackOptions, assets: Assets, deps: PackDeps) {
  const { pdfLib } = assets;
  const faceHeight = height / 2;
  const scratch = await pdfLib.PDFDocument.create();
  const scratchAssets: Assets = {
    pdfLib,
    bold: await scratch.embedFont(pdfLib.StandardFonts.HelveticaBold),
    regular: await scratch.embedFont(pdfLib.StandardFonts.Helvetica),
    logo: options.logo ? await scratch.embedPng(await deps.logoPng(options.logo)) : null,
  };
  const facePage = scratch.addPage([width, faceHeight]);
  const scratchQr = await scratch.embedPng(await deps.qrPng(itemLink(options.shortUrl, "table-tent")));
  drawFace(facePage, width, faceHeight, scratchQr, options, scratchAssets, "table-tent");

  const [face] = await pdf.embedPdf(await scratch.save());
  const page = pdf.addPage([width, height]);
  page.drawPage(face, { x: 0, y: 0, width, height: faceHeight });
  page.drawPage(face, { x: width, y: height, width, height: faceHeight, rotate: pdfLib.degrees(180) });

  const grey = pdfLib.rgb(0.6, 0.6, 0.6);
  page.drawLine({ start: { x: 0, y: faceHeight }, end: { x: width, y: faceHeight }, thickness: 0.5, color: grey, dashArray: [4, 4] });
  const label = safeText(assets.regular, options.text.fold);
  page.drawText(label, { x: 4, y: faceHeight + 2, size: 6, font: assets.regular, color: grey });
}

type Palette = { background: RGB; panel: RGB | null; accent: RGB; text: RGB; muted: RGB; star: RGB; onDark: boolean };

function palette(design: PrintDesign, color: string, rgb: typeof import("pdf-lib").rgb): Palette {
  const brand = hexToRgb(color, rgb);
  const white = rgb(1, 1, 1);
  const ink = rgb(0.07, 0.09, 0.15);
  const gold = rgb(0.96, 0.62, 0.04);
  switch (design) {
    case "bold":
      return { background: brand, panel: white, accent: white, text: white, muted: rgb(0.95, 0.95, 0.95), star: gold, onDark: true };
    case "minimal":
      return { background: white, panel: null, accent: brand, text: ink, muted: rgb(0.4, 0.4, 0.45), star: gold, onDark: false };
    case "split":
    case "classic":
    default:
      return { background: white, panel: null, accent: brand, text: ink, muted: rgb(0.4, 0.4, 0.45), star: gold, onDark: false };
  }
}

// One face of a print item. Wide items put the code on the right; tall items
// stack name, headline and stars, the code, then the call to action.
function drawFace(page: PDFPage, w: number, h: number, qr: PDFImage, options: PackOptions, assets: Assets, item: PrintItemId) {
  const { rgb } = assets.pdfLib;
  const colors = palette(options.design, options.color, rgb);
  const white = rgb(1, 1, 1);
  const pad = Math.min(w, h) * 0.07;
  const maxText = w - pad * 2;

  page.drawRectangle({ x: 0, y: 0, width: w, height: h, color: colors.background });
  if (w / h > 1.25) {
    drawWide(page, w, h, pad, qr, options, assets, colors);
    return;
  }

  const nameSize = h * 0.05;
  const headlineSize = h * 0.038;
  const sublineSize = h * 0.048;
  const hintSize = h * 0.026;
  const starRadius = Math.min(w * 0.045, h * 0.026);
  const bottomBlock = sublineSize * 1.3 + hintSize * 1.3 + pad;

  if (options.design === "minimal") {
    const inset = pad * 0.4;
    page.drawRectangle({ x: inset, y: inset, width: w - inset * 2, height: h - inset * 2, borderColor: colors.accent, borderWidth: 1.5 });
  }

  if (options.design === "split") {
    // Brand-coloured top 45% with name and headline; the code straddles the edge.
    const band = h * 0.45;
    page.drawRectangle({ x: 0, y: h - band, width: w, height: band, color: colors.accent });
    let y = drawLogo(page, w, h - pad, Math.min(w * 0.2, h * 0.08), assets, pad);
    y = drawCentered(page, options.businessName, assets.bold, w, y, maxText, nameSize, white);
    drawCentered(page, options.text.headline, assets.regular, w, y - pad * 0.2, maxText, headlineSize, white);
    const qrSize = Math.min(w - pad * 2.4, h * 0.36);
    const qrY = h - band - qrSize * 0.5;
    const p = qrSize * 0.06;
    page.drawRectangle({ x: (w - qrSize) / 2 - p, y: qrY - p, width: qrSize + p * 2, height: qrSize + p * 2, color: white });
    page.drawImage(qr, { x: (w - qrSize) / 2, y: qrY, width: qrSize, height: qrSize });
    if (options.stars !== false) drawStars(page, w / 2, qrY - p - starRadius * 1.6, starRadius, colors.star);
    const after = drawCentered(page, options.text.subline, assets.bold, w, qrY - p - starRadius * 3, maxText, sublineSize, colors.accent);
    drawCentered(page, options.text.scanHint, assets.regular, w, after, maxText, hintSize, colors.muted);
    return;
  }

  // Classic: brand band behind the name. Bold: whole page in brand colour.
  let y = h - pad;
  if (options.design === "classic") {
    const logoHeight = assets.logo ? Math.min(w * 0.2, h * 0.08) + pad * 0.4 : 0;
    const band = pad * 1.6 + logoHeight + nameSize * 1.3;
    page.drawRectangle({ x: 0, y: h - band, width: w, height: band, color: colors.accent });
    y = drawLogo(page, w, y, Math.min(w * 0.2, h * 0.08), assets, pad);
    drawCentered(page, options.businessName, assets.bold, w, y, maxText, nameSize, white);
    y = h - band - pad * 0.6;
  } else {
    y = drawLogo(page, w, y, Math.min(w * 0.2, h * 0.08), assets, pad);
    y = drawCentered(page, options.businessName, assets.bold, w, y, maxText, nameSize, colors.text);
    y -= pad * 0.3;
  }
  y = drawCentered(page, options.text.headline, assets.regular, w, y, maxText, headlineSize, colors.text);
  if (options.stars !== false) drawStars(page, w / 2, y - starRadius, starRadius, colors.star);
  y -= starRadius * 2 + pad * 0.6;

  // The code takes whatever height is left above the call to action.
  const panelPad = colors.panel ? pad * 0.35 : 0;
  const qrSize = Math.max(20, Math.min(w - pad * 2.4, y - bottomBlock - panelPad * 2));
  const qrY = y - panelPad - qrSize;
  if (colors.panel) {
    page.drawRectangle({ x: (w - qrSize) / 2 - panelPad, y: qrY - panelPad, width: qrSize + panelPad * 2, height: qrSize + panelPad * 2, color: colors.panel });
  }
  page.drawImage(qr, { x: (w - qrSize) / 2, y: qrY, width: qrSize, height: qrSize });

  const after = drawCentered(page, options.text.subline, assets.bold, w, qrY - panelPad - pad * 0.4, maxText, sublineSize, colors.onDark ? white : colors.accent);
  drawCentered(page, options.text.scanHint, assets.regular, w, after, maxText, hintSize, colors.muted);
  void item;
}

// Centred logo at the top; returns the y below it.
function drawLogo(page: PDFPage, w: number, top: number, size: number, assets: Assets, pad: number): number {
  if (!assets.logo) return top;
  const dims = assets.logo.scaleToFit(size * 2, size);
  page.drawImage(assets.logo, { x: (w - dims.width) / 2, y: top - dims.height, width: dims.width, height: dims.height });
  return top - dims.height - pad * 0.4;
}

function drawWide(page: PDFPage, w: number, h: number, pad: number, qr: PDFImage, options: PackOptions, assets: Assets, colors: Palette) {
  const { rgb } = assets.pdfLib;
  const white = rgb(1, 1, 1);
  const qrSize = Math.min(h - pad * 2.4, w * 0.42);
  const qrX = w - pad * 1.2 - qrSize;
  const qrY = (h - qrSize) / 2;
  const stripe = w * 0.05;
  if (options.design === "classic" || options.design === "split") {
    page.drawRectangle({ x: 0, y: 0, width: stripe, height: h, color: colors.accent });
  }
  if (options.design === "minimal") {
    const inset = pad * 0.4;
    page.drawRectangle({ x: inset, y: inset, width: w - inset * 2, height: h - inset * 2, borderColor: colors.accent, borderWidth: 1.5 });
  }
  if (colors.panel) {
    const p = pad * 0.4;
    page.drawRectangle({ x: qrX - p, y: qrY - p, width: qrSize + p * 2, height: qrSize + p * 2, color: colors.panel });
  }
  page.drawImage(qr, { x: qrX, y: qrY, width: qrSize, height: qrSize });

  const left = stripe + pad;
  const maxWidth = qrX - left - pad;
  const starRadius = Math.min(h * 0.045, maxWidth / 12);
  let y = h - pad * 1.2;
  y = drawLeft(page, options.businessName, assets.bold, left, y, maxWidth, h * 0.1, colors.text);
  y = drawLeft(page, options.text.headline, assets.regular, left, y - pad * 0.2, maxWidth, h * 0.07, colors.text);
  if (options.stars !== false) drawStars(page, left + starRadius * 5.6, y - starRadius * 1.2, starRadius, colors.star);
  y -= starRadius * 2.4 + pad * 0.6;
  y = drawLeft(page, options.text.subline, assets.bold, left, y, maxWidth, h * 0.085, colors.onDark ? white : colors.accent);
  drawLeft(page, options.text.scanHint, assets.regular, left, y, maxWidth, h * 0.055, colors.muted);
}

// Draws text centred, shrinking it to fit; returns the y below it.
function drawCentered(page: PDFPage, raw: string, font: PDFFont, pageWidth: number, top: number, maxWidth: number, size: number, color: RGB): number {
  const text = safeText(font, raw);
  const fitted = fitSize(font, text, maxWidth, size);
  const width = font.widthOfTextAtSize(text, fitted);
  page.drawText(text, { x: (pageWidth - width) / 2, y: top - fitted, size: fitted, font, color });
  return top - fitted * 1.3;
}

function drawLeft(page: PDFPage, raw: string, font: PDFFont, x: number, top: number, maxWidth: number, size: number, color: RGB): number {
  const text = safeText(font, raw);
  const fitted = fitSize(font, text, maxWidth, size);
  page.drawText(text, { x, y: top - fitted, size: fitted, font, color });
  return top - fitted * 1.3;
}

function fitSize(font: PDFFont, text: string, maxWidth: number, size: number): number {
  let fitted = size;
  while (fitted > 4 && font.widthOfTextAtSize(text, fitted) > maxWidth) fitted -= 0.5;
  return fitted;
}

// Five neutral stars (no Google logo), centred on cx.
function drawStars(page: PDFPage, cx: number, cy: number, radius: number, color: RGB) {
  const gap = radius * 2.3;
  for (let i = -2; i <= 2; i++) {
    page.drawSvgPath(starPath(radius), { x: cx + i * gap, y: cy, color });
  }
}

function starPath(r: number): string {
  const points: string[] = [];
  for (let i = 0; i < 10; i++) {
    const radius = i % 2 === 0 ? r : r * 0.45;
    const angle = (Math.PI / 5) * i - Math.PI / 2;
    points.push(`${(Math.cos(angle) * radius).toFixed(2)} ${(Math.sin(angle) * radius).toFixed(2)}`);
  }
  return `M ${points.join(" L ")} Z`;
}

// Standard PDF fonts cover Latin-1 (French accents included); drop anything else.
export function safeText(font: Pick<PDFFont, "encodeText">, text: string): string {
  return Array.from(text)
    .filter((char) => {
      try {
        font.encodeText(char);
        return true;
      } catch {
        return false;
      }
    })
    .join("")
    .trim();
}

function hexToRgb(hex: string, rgb: typeof import("pdf-lib").rgb): RGB {
  const match = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(hex) ?? ["", "16", "65", "34"];
  return rgb(parseInt(match[1], 16) / 255, parseInt(match[2], 16) / 255, parseInt(match[3], 16) / 255);
}
