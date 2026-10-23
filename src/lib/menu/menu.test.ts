import { describe, expect, it } from "vitest";
import { hasHours, isMenuPath, normalizePhone, normalizeWhatsapp, parseHours, parseSections, pick, publicFileUrl } from "./menu";

const WS = "11111111-1111-4111-8111-111111111111";
const MENU = "22222222-2222-4222-8222-222222222222";
const own = (path: string) => isMenuPath(path, WS, MENU);

describe("parseSections", () => {
  it("keeps valid sections and trims text", () => {
    const sections = parseSections(
      [
        {
          id: "s1",
          title: { en: "  Starters ", fr: "Entrées", de: "Vorspeisen" },
          items: [
            {
              id: "i1",
              name: { en: "Harira\n soup" },
              description: { en: "Lentils" },
              price: " 25 MAD ",
              photo: `${WS}/${MENU}/abc.jpg`,
              allergens: ["gluten", "celery", "plutonium"],
              extra: "dropped",
            },
          ],
        },
      ],
      ["en", "fr"],
      own,
    );
    expect(sections).toEqual([
      {
        id: "s1",
        title: { en: "Starters", fr: "Entrées" },
        items: [
          { id: "i1", name: { en: "Harira soup" }, description: { en: "Lentils" }, price: "25 MAD", photo: `${WS}/${MENU}/abc.jpg`, allergens: ["gluten", "celery"] },
        ],
      },
    ]);
  });

  it("drops photos outside the menu's folder and blank items", () => {
    const sections = parseSections(
      [{ id: "s1", title: {}, items: [{ id: "i1", name: { en: "Tea" }, photo: `${WS}/33333333-3333-4333-8333-333333333333/x.jpg` }, { id: "i2", name: { en: " " } }] }],
      ["en"],
      own,
    );
    expect(sections?.[0].items).toHaveLength(1);
    expect(sections?.[0].items[0].photo).toBeNull();
  });

  it("rejects bad shapes and oversized menus", () => {
    expect(parseSections({}, ["en"], own)).toBeNull();
    expect(parseSections([{ id: "bad id!", items: [] }], ["en"], own)).toBeNull();
    expect(parseSections(Array.from({ length: 31 }, (_, i) => ({ id: `s${i}`, items: [] })), ["en"], own)).toBeNull();
  });
});

describe("opening hours", () => {
  it("keeps valid days, closed days and late closing", () => {
    expect(parseHours({ mon: { open: "09:00", close: "22:00" }, tue: null, fri: { open: "18:00", close: "02:00" }, sat: { open: "25:00", close: "10:00" }, xyz: null })).toEqual({
      mon: { open: "09:00", close: "22:00" },
      tue: null,
      fri: { open: "18:00", close: "02:00" },
    });
    expect(hasHours({})).toBe(false);
    expect(hasHours({ tue: null })).toBe(true);
  });
});

describe("helpers", () => {
  it("picks the visitor's language, then the default", () => {
    expect(pick({ en: "Tea", fr: "Thé" }, "fr", "en")).toBe("Thé");
    expect(pick({ en: "Tea" }, "ar", "en")).toBe("Tea");
    expect(pick({ es: "Té" }, "ar", "en")).toBe("Té");
  });

  it("normalizes phone numbers", () => {
    expect(normalizePhone("+212 6 12-34-56-78")).toBe("+212612345678");
    expect(normalizePhone("")).toBeNull();
    expect(normalizePhone("call me")).toBeUndefined();
    expect(normalizeWhatsapp("+212 612 345 678")).toBe("212612345678");
    expect(normalizeWhatsapp("00212612345678")).toBe("212612345678");
  });

  it("checks storage paths and builds public URLs", () => {
    expect(own(`${WS}/${MENU}/menu-1.pdf`)).toBe(true);
    expect(own(`${WS}/${MENU}/../x.pdf`)).toBe(false);
    expect(own(`${WS}/${MENU}/menu.html`)).toBe(false);
    expect(publicFileUrl("https://abc.supabase.co/", "a/b.pdf")).toBe("https://abc.supabase.co/storage/v1/object/public/menu-files/a/b.pdf");
  });
});
