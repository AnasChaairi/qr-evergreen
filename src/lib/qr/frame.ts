// Wraps the raw QR SVG from qr-code-styling in our own SVG: quiet zone, optional
// frame and call-to-action text. PNG and PDF are rasterized from this same SVG,
// so all three downloads look identical.

export type FrameOptions = {
  background: string;
  frame: { enabled: boolean; color: string; textColor: string; text: string };
};

export const QR_SIZE = 1000;
const QUIET_ZONE = 80;
const BORDER = 40;
const TEXT_BAND = 190;
const FONT_SIZE = 92;

export function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// Places the QR's root <svg> at (x, y) inside the parent, keeping its viewBox.
export function nestSvg(qrSvg: string, x: number, y: number, size: number): string {
  const withoutProlog = qrSvg.replace(/<\?xml[^>]*\?>\s*/i, "");
  return withoutProlog.replace(/<svg\b([^>]*)>/i, (_match, attrs: string) => {
    const cleaned = attrs.replace(/\s(?:x|y|width|height)="[^"]*"/g, "");
    return `<svg${cleaned} x="${x}" y="${y}" width="${size}" height="${size}">`;
  });
}

export function frameDimensions(frameEnabled: boolean): { width: number; height: number } {
  const inner = QR_SIZE + QUIET_ZONE * 2;
  if (!frameEnabled) return { width: inner, height: inner };
  const width = inner + BORDER * 2;
  return { width, height: width + TEXT_BAND - BORDER };
}

export function composeSvg(qrSvg: string, options: FrameOptions): string {
  const { width, height } = frameDimensions(options.frame.enabled);
  const inner = QR_SIZE + QUIET_ZONE * 2;
  const parts: string[] = [];

  if (options.frame.enabled) {
    parts.push(
      `<rect width="${width}" height="${height}" rx="64" fill="${escapeXml(options.frame.color)}"/>`,
      `<rect x="${BORDER}" y="${BORDER}" width="${inner}" height="${inner}" rx="32" fill="${escapeXml(options.background)}"/>`,
      nestSvg(qrSvg, BORDER + QUIET_ZONE, BORDER + QUIET_ZONE, QR_SIZE),
    );
    const text = options.frame.text.trim();
    if (text) {
      const baseline = BORDER + inner + (TEXT_BAND - BORDER) / 2 + FONT_SIZE * 0.35;
      parts.push(
        `<text x="${width / 2}" y="${baseline}" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-weight="700" font-size="${FONT_SIZE}" fill="${escapeXml(options.frame.textColor)}">${escapeXml(text)}</text>`,
      );
    }
  } else {
    parts.push(
      `<rect width="${width}" height="${height}" fill="${escapeXml(options.background)}"/>`,
      nestSvg(qrSvg, QUIET_ZONE, QUIET_ZONE, QR_SIZE),
    );
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${parts.join("")}</svg>`;
}
