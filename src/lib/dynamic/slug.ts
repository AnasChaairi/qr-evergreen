// 7-character base62 short slugs (62^7 ≈ 3.5 trillion), from a CSPRNG.

const ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
export const SLUG_LENGTH = 7;
export const SLUG_PATTERN = /^[A-Za-z0-9]{7}$/;

export function generateSlug(random: (bytes: Uint8Array) => Uint8Array = (b) => crypto.getRandomValues(b)): string {
  let slug = "";
  while (slug.length < SLUG_LENGTH) {
    const bytes = random(new Uint8Array(16));
    for (const byte of bytes) {
      // Reject 248..255 so every character is equally likely (248 = 62 * 4).
      if (byte < 248 && slug.length < SLUG_LENGTH) slug += ALPHABET[byte % 62];
    }
  }
  return slug;
}

export function shortBaseUrl(): string {
  const site = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://qrevergreen.com").replace(/\/$/, "");
  return (process.env.NEXT_PUBLIC_SHORT_URL ?? `${site}/q`).replace(/\/$/, "");
}

export function shortUrl(slug: string): string {
  return `${shortBaseUrl()}/${slug}`;
}
