// Menu QR data: languages, builder sections, opening hours and file rules.
// Shared by the dashboard, the server actions and the public /m/ page, so
// everything here is plain data and pure functions.

export const MENU_LANGS = ["en", "fr", "ar", "es"] as const;
export type MenuLang = (typeof MENU_LANGS)[number];

export function isMenuLang(value: unknown): value is MenuLang {
  return typeof value === "string" && (MENU_LANGS as readonly string[]).includes(value);
}

// The 14 allergens that EU food businesses must declare.
export const ALLERGENS = [
  "gluten",
  "crustaceans",
  "eggs",
  "fish",
  "peanuts",
  "soy",
  "milk",
  "nuts",
  "celery",
  "mustard",
  "sesame",
  "sulphites",
  "lupin",
  "molluscs",
] as const;
export type Allergen = (typeof ALLERGENS)[number];

export type Localized = Partial<Record<MenuLang, string>>;
export type MenuItem = {
  id: string;
  name: Localized;
  description: Localized;
  price: string;
  photo: string | null; // storage path
  allergens: Allergen[];
};
export type MenuSection = { id: string; title: Localized; items: MenuItem[] };

export const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
export type Day = (typeof DAYS)[number];
export type DayHours = { open: string; close: string } | null; // null = closed
export type OpeningHours = Partial<Record<Day, DayHours>>;

export const LIMITS = { sections: 30, items: 60, name: 80, description: 300, price: 20, title: 80 } as const;

// Files: PDF or image for the whole menu, images for item photos.
export const MENU_BUCKET = "menu-files";
export const MAX_FILE_BYTES = 10 * 1024 * 1024;
export const FILE_TYPES = {
  "application/pdf": "pdf",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;
export type FileMime = keyof typeof FILE_TYPES;

export function isFileMime(value: unknown): value is FileMime {
  return typeof value === "string" && value in FILE_TYPES;
}

// Objects are stored as {workspace}/{menu}/{name}.{ext}.
const PATH_PATTERN = /^[0-9a-f-]{36}\/[0-9a-f-]{36}\/[A-Za-z0-9_-]+\.(pdf|jpg|png|webp)$/;

export function menuFolder(workspaceId: string, menuId: string): string {
  return `${workspaceId}/${menuId}/`;
}

export function isMenuPath(path: unknown, workspaceId: string, menuId: string): path is string {
  return typeof path === "string" && PATH_PATTERN.test(path) && path.startsWith(menuFolder(workspaceId, menuId));
}

export function publicFileUrl(supabaseUrl: string, path: string): string {
  return `${supabaseUrl.replace(/\/$/, "")}/storage/v1/object/public/${MENU_BUCKET}/${path}`;
}

function clip(value: unknown, max: number): string {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim().slice(0, max) : "";
}

function localized(value: unknown, langs: readonly MenuLang[], max: number): Localized {
  const out: Localized = {};
  if (!value || typeof value !== "object") return out;
  for (const lang of langs) {
    const text = clip((value as Record<string, unknown>)[lang], max);
    if (text) out[lang] = text;
  }
  return out;
}

const ID_PATTERN = /^[A-Za-z0-9_-]{1,40}$/;

// Validates builder JSON from the browser: unknown keys dropped, text
// trimmed and capped, photos limited to this menu's folder. Returns null when
// the shape is wrong or a limit is exceeded.
export function parseSections(raw: unknown, langs: readonly MenuLang[], isOwnPath: (path: string) => boolean): MenuSection[] | null {
  if (!Array.isArray(raw) || raw.length > LIMITS.sections) return null;
  const sections: MenuSection[] = [];
  for (const section of raw) {
    if (!section || typeof section !== "object") return null;
    const s = section as Record<string, unknown>;
    if (!ID_PATTERN.test(String(s.id)) || !Array.isArray(s.items) || s.items.length > LIMITS.items) return null;
    const items: MenuItem[] = [];
    for (const item of s.items) {
      if (!item || typeof item !== "object") return null;
      const i = item as Record<string, unknown>;
      if (!ID_PATTERN.test(String(i.id))) return null;
      const name = localized(i.name, langs, LIMITS.name);
      if (Object.keys(name).length === 0) continue; // blank rows are dropped
      const photo = typeof i.photo === "string" && isOwnPath(i.photo) ? i.photo : null;
      const allergens = Array.isArray(i.allergens)
        ? ALLERGENS.filter((a) => (i.allergens as unknown[]).includes(a))
        : [];
      items.push({
        id: String(i.id),
        name,
        description: localized(i.description, langs, LIMITS.description),
        price: clip(i.price, LIMITS.price),
        photo,
        allergens,
      });
    }
    sections.push({ id: String(s.id), title: localized(s.title, langs, LIMITS.title), items });
  }
  return sections;
}

const TIME = /^([01][0-9]|2[0-3]):[0-5][0-9]$/;

// Closing after midnight is allowed (e.g. 18:00 to 02:00).
export function parseHours(raw: unknown): OpeningHours {
  const hours: OpeningHours = {};
  if (!raw || typeof raw !== "object") return hours;
  for (const day of DAYS) {
    const value = (raw as Record<string, unknown>)[day];
    if (value === null) hours[day] = null;
    else if (value && typeof value === "object") {
      const { open, close } = value as Record<string, unknown>;
      if (typeof open === "string" && typeof close === "string" && TIME.test(open) && TIME.test(close) && open !== close) {
        hours[day] = { open, close };
      }
    }
  }
  return hours;
}

export function hasHours(hours: OpeningHours): boolean {
  return DAYS.some((day) => day in hours);
}

// Text in the visitor's language, else the menu's default, else any.
export function pick(text: Localized, lang: MenuLang, fallback: MenuLang): string {
  return text[lang] || text[fallback] || Object.values(text).find(Boolean) || "";
}

// Phone numbers: digits with an optional leading + for calls; WhatsApp needs
// the international number without +. Empty gives null, invalid gives undefined.
export function normalizePhone(value: string): string | null | undefined {
  const compact = value.replace(/[\s().-]/g, "");
  if (!compact) return null;
  return /^\+?[0-9]{6,15}$/.test(compact) ? compact : undefined;
}

export function normalizeWhatsapp(value: string): string | null | undefined {
  const digits = value.replace(/[\s()+.-]/g, "").replace(/^00/, "");
  if (!digits) return null;
  return /^[0-9]{6,15}$/.test(digits) ? digits : undefined;
}

export function rtl(lang: MenuLang): boolean {
  return lang === "ar";
}

// Cache tag for a menu's public page data.
export function menuTag(slug: string): string {
  return `menu:${slug}`;
}
