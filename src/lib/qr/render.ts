// Browser-only rendering: draws the code with qr-code-styling, wraps it with
// composeSvg, and exports SVG, PNG and PDF without any server round trip.

import type { CornerSquareType, DotType, Options } from "qr-code-styling";
import { composeSvg, type FrameOptions } from "./frame";

export type Design = {
  foreground: string;
  background: string;
  dotType: DotType;
  cornerType: CornerSquareType;
  logo: string | null; // data URL
  frame: FrameOptions["frame"];
};

export const DEFAULT_DESIGN: Design = {
  foreground: "#12261d",
  background: "#ffffff",
  dotType: "square",
  cornerType: "square",
  logo: null,
  frame: { enabled: false, color: "#0f6b45", textColor: "#ffffff", text: "" },
};

export async function renderSvg(data: string, design: Design): Promise<string> {
  const { default: QRCodeStyling } = await import("qr-code-styling");
  const options: Partial<Options> = {
    type: "svg",
    width: 1000,
    height: 1000,
    margin: 0,
    data,
    image: design.logo ?? undefined,
    // A logo hides part of the pattern, so use the highest error correction then.
    qrOptions: { errorCorrectionLevel: design.logo ? "H" : "Q" },
    imageOptions: { saveAsBlob: true, hideBackgroundDots: true, imageSize: 0.3, margin: 12 },
    dotsOptions: { type: design.dotType, color: design.foreground },
    cornersSquareOptions: { type: design.cornerType, color: design.foreground },
    cornersDotOptions: { color: design.foreground },
    backgroundOptions: { color: design.background },
  };
  const qr = new QRCodeStyling(options);
  const blob = await qr.getRawData("svg");
  if (!blob) throw new Error("QR rendering failed");
  const raw = await (blob as Blob).text();
  return composeSvg(raw, { background: design.background, frame: design.frame });
}

export function svgToBlob(svg: string): Blob {
  return new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
}

export async function svgToPng(svg: string, targetWidth = 2000): Promise<Blob> {
  const url = URL.createObjectURL(svgToBlob(svg));
  try {
    const image = new Image();
    image.decoding = "async";
    image.src = url;
    await image.decode();
    const scale = targetWidth / image.naturalWidth;
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(image.naturalWidth * scale);
    canvas.height = Math.round(image.naturalHeight * scale);
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas is not available");
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("PNG export failed"))), "image/png"),
    );
  } finally {
    URL.revokeObjectURL(url);
  }
}

// One page sized to the code (4 inches wide plus margins), high-resolution PNG inside.
export async function svgToPdf(svg: string): Promise<Blob> {
  const [{ PDFDocument }, png] = await Promise.all([import("pdf-lib"), svgToPng(svg, 2400)]);
  const pdf = await PDFDocument.create();
  const image = await pdf.embedPng(await png.arrayBuffer());
  const width = 288;
  const height = (image.height / image.width) * width;
  const margin = 36;
  const page = pdf.addPage([width + margin * 2, height + margin * 2]);
  page.drawImage(image, { x: margin, y: margin, width, height });
  pdf.setTitle("QR code");
  pdf.setCreator("QR Evergreen");
  const bytes = await pdf.save();
  return new Blob([bytes as BlobPart], { type: "application/pdf" });
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Relative luminance check: QR readers need a dark pattern on a light background.
export function hasGoodContrast(foreground: string, background: string): boolean {
  const luminance = (hex: string) => {
    const match = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(hex);
    if (!match) return 0;
    const [r, g, b] = match.slice(1).map((part) => {
      const channel = parseInt(part, 16) / 255;
      return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const fg = luminance(foreground);
  const bg = luminance(background);
  return bg > fg && (bg + 0.05) / (fg + 0.05) >= 3;
}
