"use client";

import { useRouter } from "next/navigation";
import { useActionState, useState, useTransition } from "react";
import {
  createMenu,
  finishMenuFile,
  saveMenuSections,
  startMenuUpload,
  updateMenuDetails,
  type MenuActionState,
} from "@/app/[lang]/dashboard/menus/actions";
import type { DashboardStrings } from "@/content/dashboard";
import type { MenuStrings } from "@/content/menu";
import type { Locale } from "@/lib/i18n";
import {
  ALLERGENS,
  DAYS,
  MAX_FILE_BYTES,
  MENU_BUCKET,
  MENU_LANGS,
  isFileMime,
  publicFileUrl,
  rtl,
  type Allergen,
  type Localized,
  type MenuItem,
  type MenuLang,
  type MenuSection,
  type OpeningHours,
} from "@/lib/menu/menu";
import { resizeImage } from "@/lib/menu/resize";
import { downloadBlob } from "@/lib/qr/render";
import { PRINT_DESIGNS, type PrintDesign } from "@/lib/review/kit";
import { buildPrintPack } from "@/lib/review/printPack";
import { createClient } from "@/lib/supabase/browser";
import { SUPABASE_URL } from "@/lib/supabase/env";

const inputClass = "field mt-2";
const smallInput = "field min-h-11 px-3 py-2";
const buttonClass = "btn btn-primary";
const quietButton =
  "inline-flex min-h-11 items-center gap-1 rounded-full border-[1.5px] border-stone-300 bg-white px-4 text-[15px] font-medium text-stone-800 hover:border-brand-700 hover:bg-brand-50 disabled:opacity-40";

type Errors = DashboardStrings["errors"] & MenuStrings["errors"];

function errorText(error: string | undefined, errors: Errors): string | null {
  if (!error) return null;
  return errors[error as keyof Errors] ?? errors.generic;
}

function ErrorText({ state, errors }: { state: MenuActionState; errors: Errors }) {
  const text = errorText(state?.error, errors);
  return text ? (
    <p role="alert" className="text-sm text-red-700">
      {text}
    </p>
  ) : null;
}

export function CreateMenuForm({ locale, t, errors }: { locale: Locale; t: MenuStrings; errors: Errors }) {
  const [state, action, pending] = useActionState(createMenu, null);
  return (
    <form action={action} className="space-y-4 card">
      <h2 className="text-xl font-bold text-stone-900">{t.create.heading}</h2>
      <input type="hidden" name="locale" value={locale} />
      <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
        <label className="block text-[15px] font-semibold text-stone-800">
          {t.create.title}
          <input name="title" required maxLength={80} placeholder={t.create.titlePlaceholder} className={inputClass} />
        </label>
        <label className="block text-[15px] font-semibold text-stone-800">
          {t.create.language}
          <select name="language" defaultValue={locale} className={inputClass}>
            {MENU_LANGS.map((lang) => (
              <option key={lang} value={lang}>
                {t.langNames[lang]}
              </option>
            ))}
          </select>
        </label>
      </div>
      <ErrorText state={state} errors={errors} />
      <button type="submit" disabled={pending} className={buttonClass}>
        {t.create.submit}
      </button>
    </form>
  );
}

export function MenuDetailsForm({
  locale,
  id,
  t,
  errors,
  title,
  languages,
  maxLanguages,
  color,
  phone,
  whatsapp,
  hours,
}: {
  locale: Locale;
  id: string;
  t: MenuStrings;
  errors: Errors;
  title: string;
  languages: MenuLang[];
  maxLanguages: number;
  color: string;
  phone: string;
  whatsapp: string;
  hours: OpeningHours;
}) {
  const [state, action, pending] = useActionState(updateMenuDetails, null);
  const [defaultLang, setDefaultLang] = useState<MenuLang>(languages[0]);
  const [extras, setExtras] = useState<MenuLang[]>(languages.slice(1));
  const [closed, setClosed] = useState(() => Object.fromEntries(DAYS.map((d) => [d, hours[d] === null])));
  const total = 1 + extras.filter((l) => l !== defaultLang).length;

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="id" value={id} />
      <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
        <label className="block text-[15px] font-semibold text-stone-800">
          {t.edit.title}
          <input name="title" required maxLength={80} defaultValue={title} className={inputClass} />
        </label>
        <label className="block text-[15px] font-semibold text-stone-800">
          {t.edit.color}
          <input name="color" type="color" defaultValue={color} className="mt-2 block h-12 w-20 cursor-pointer rounded-xl border-[1.5px] border-stone-300 bg-white p-1.5" />
        </label>
      </div>

      <fieldset className="space-y-2">
        <legend className="text-[15px] font-semibold text-stone-800">{t.edit.languages}</legend>
        <select name="defaultLanguage" value={defaultLang} onChange={(e) => setDefaultLang(e.target.value as MenuLang)} className={`${smallInput} max-w-48`}>
          {MENU_LANGS.map((lang) => (
            <option key={lang} value={lang}>
              {t.langNames[lang]}
            </option>
          ))}
        </select>
        <div className="flex flex-wrap gap-3">
          {MENU_LANGS.filter((lang) => lang !== defaultLang).map((lang) => {
            const checked = extras.includes(lang);
            const locked = !checked && total >= maxLanguages && !languages.includes(lang);
            return (
              <label key={lang} className={`flex items-center gap-2 text-sm ${locked ? "text-stone-400" : "text-stone-700"}`}>
                <input
                  type="checkbox"
                  name="languages"
                  value={lang}
                  checked={checked}
                  disabled={locked}
                  onChange={(e) => setExtras(e.target.checked ? [...extras, lang] : extras.filter((l) => l !== lang))}
                  className="h-5 w-5 accent-brand-700"
                />
                {t.langNames[lang]}
              </label>
            );
          })}
        </div>
        <p className="text-xs text-stone-500">{maxLanguages > 1 ? t.edit.languagesHelp : t.edit.languagesLocked}</p>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-[15px] font-semibold text-stone-800">
          {t.edit.phone}
          <input name="phone" type="tel" defaultValue={phone} className={inputClass} />
        </label>
        <label className="block text-[15px] font-semibold text-stone-800">
          {t.edit.whatsapp}
          <input name="whatsapp" inputMode="numeric" defaultValue={whatsapp} className={inputClass} />
        </label>
      </div>

      <fieldset>
        <legend className="mb-3 text-[15px] font-semibold text-stone-800">{t.edit.hours}</legend>
        <div className="space-y-2">
          {DAYS.map((day) => (
            <div key={day} className="grid grid-cols-[4.5rem_minmax(0,1fr)_minmax(0,1fr)_auto] items-center gap-1.5 text-sm sm:grid-cols-[6rem_minmax(0,1fr)_minmax(0,1fr)_auto] sm:gap-2">
              <span className="text-stone-700">{t.days[day]}</span>
              <input
                type="time"
                name={`open_${day}`}
                aria-label={`${t.days[day]} ${t.edit.opens}`}
                defaultValue={hours[day]?.open ?? ""}
                disabled={closed[day]}
                className={`${smallInput} min-w-0 px-1.5`}
              />
              <input
                type="time"
                name={`close_${day}`}
                aria-label={`${t.days[day]} ${t.edit.closes}`}
                defaultValue={hours[day]?.close ?? ""}
                disabled={closed[day]}
                className={`${smallInput} min-w-0 px-1.5`}
              />
              <label className="flex items-center gap-1 text-stone-600">
                <input
                  type="checkbox"
                  name={`closed_${day}`}
                  checked={closed[day]}
                  onChange={(e) => setClosed({ ...closed, [day]: e.target.checked })}
                  className="h-5 w-5 accent-brand-700"
                />
                {t.edit.closed}
              </label>
            </div>
          ))}
        </div>
      </fieldset>

      {state?.ok && <p className="text-sm text-brand-700">{t.edit.saved}</p>}
      <ErrorText state={state} errors={errors} />
      <button type="submit" disabled={pending} className={buttonClass}>
        {t.edit.save}
      </button>
    </form>
  );
}

// Signed upload: ask the server for a one-time URL, then send the file to Storage.
async function uploadFile(locale: Locale, menuId: string, kind: "file" | "photo", file: File): Promise<{ path: string } | { error: string }> {
  if (!isFileMime(file.type) || (kind === "photo" && file.type === "application/pdf")) return { error: "file" };
  let blob: Blob = file;
  if (file.type !== "application/pdf") blob = await resizeImage(file, kind === "photo" ? 1200 : 2400);
  if (blob.size > MAX_FILE_BYTES) return { error: "fileSize" };
  const ticket = await startMenuUpload(locale, menuId, kind, blob.type, blob.size);
  if ("error" in ticket) return ticket;
  const { error } = await createClient().storage.from(MENU_BUCKET).uploadToSignedUrl(ticket.path, ticket.token, blob, { contentType: blob.type });
  return error ? { error: "generic" } : { path: ticket.path };
}

export function MenuFileUpload({
  locale,
  id,
  t,
  errors,
  currentPath,
}: {
  locale: Locale;
  id: string;
  t: MenuStrings;
  errors: Errors;
  currentPath: string | null;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  async function onFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setMessage(null);
    try {
      const uploaded = await uploadFile(locale, id, "file", file);
      const result = "error" in uploaded ? uploaded : await finishMenuFile(locale, id, uploaded.path);
      if (result?.error) setMessage({ ok: false, text: errorText(result.error, errors)! });
      else {
        setMessage({ ok: true, text: t.upload.done });
        router.refresh();
      }
    } catch {
      setMessage({ ok: false, text: errors.generic });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-bold text-stone-900">{t.upload.heading}</h2>
      <p className="text-[15px] text-stone-600">{t.upload.help}</p>
      {currentPath && (
        <p className="text-sm text-stone-700">
          {t.upload.current}:{" "}
          <a href={publicFileUrl(SUPABASE_URL, currentPath)} target="_blank" rel="noopener" className="break-all font-semibold text-brand-700 underline underline-offset-4">
            {currentPath.split("/").pop()}
          </a>
        </p>
      )}
      <label className={`${buttonClass} inline-block cursor-pointer ${busy ? "pointer-events-none bg-stone-300" : ""}`}>
        {busy ? t.upload.uploading : currentPath ? t.upload.replace : t.upload.choose}
        <input
          type="file"
          accept="application/pdf,image/jpeg,image/png,image/webp"
          className="sr-only"
          disabled={busy}
          onChange={(e) => {
            onFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </label>
      {message && (
        <p role={message.ok ? "status" : "alert"} className={`text-sm ${message.ok ? "text-brand-700" : "text-red-700"}`}>
          {message.text}
        </p>
      )}
    </div>
  );
}

const newId = () => crypto.randomUUID().replaceAll("-", "").slice(0, 10);
const emptyItem = (): MenuItem => ({ id: newId(), name: {}, description: {}, price: "", photo: null, allergens: [] });

function move<T>(list: T[], index: number, by: number): T[] {
  const target = index + by;
  if (target < 0 || target >= list.length) return list;
  const copy = [...list];
  [copy[index], copy[target]] = [copy[target], copy[index]];
  return copy;
}

export function MenuBuilder({
  locale,
  id,
  t,
  errors,
  languages,
  initial,
  locked,
}: {
  locale: Locale;
  id: string;
  t: MenuStrings;
  errors: Errors;
  languages: MenuLang[];
  initial: MenuSection[];
  locked: boolean;
}) {
  const [sections, setSections] = useState<MenuSection[]>(initial.length > 0 ? initial : [{ id: newId(), title: {}, items: [emptyItem()] }]);
  const [lang, setLang] = useState<MenuLang>(languages[0]);
  const [dirty, setDirty] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);
  const [saving, startSave] = useTransition();
  const [uploading, setUploading] = useState<string | null>(null);

  function update(next: MenuSection[]) {
    setSections(next);
    setDirty(true);
    setStatus(null);
  }
  const setSection = (index: number, patch: Partial<MenuSection>) => update(sections.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  const setItem = (si: number, ii: number, patch: Partial<MenuItem>) =>
    setSection(si, { items: sections[si].items.map((item, i) => (i === ii ? { ...item, ...patch } : item)) });
  const text = (value: Localized, next: string): Localized => ({ ...value, [lang]: next });

  async function onPhoto(si: number, ii: number, file: File | undefined) {
    if (!file) return;
    const itemId = sections[si].items[ii].id;
    setUploading(itemId);
    try {
      const result = await uploadFile(locale, id, "photo", file);
      if ("error" in result) setStatus({ ok: false, text: errorText(result.error, errors)! });
      else setItem(si, ii, { photo: result.path });
    } catch {
      setStatus({ ok: false, text: errors.generic });
    } finally {
      setUploading(null);
    }
  }

  function save() {
    startSave(async () => {
      const result = await saveMenuSections(locale, id, sections);
      if (result?.error) setStatus({ ok: false, text: errorText(result.error, errors)! });
      else {
        setDirty(false);
        setStatus({ ok: true, text: t.builder.saved });
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-stone-900">{t.builder.heading}</h2>
        {languages.length > 1 && (
          <div role="tablist" aria-label={t.edit.languages} className="flex gap-1 rounded-full bg-stone-100 p-1">
            {languages.map((l) => (
              <button
                key={l}
                type="button"
                role="tab"
                aria-selected={lang === l}
                onClick={() => setLang(l)}
                className={`rounded-full px-3 py-1 text-sm ${lang === l ? "bg-white font-medium text-stone-900 shadow-sm" : "text-[17px] text-stone-600"}`}
              >
                {t.langNames[l]}
              </button>
            ))}
          </div>
        )}
      </div>

      <fieldset disabled={locked} className="space-y-4" dir={rtl(lang) ? "rtl" : undefined} lang={lang}>
        {sections.map((section, si) => (
          <div key={section.id} className="space-y-3 rounded-2xl border border-stone-200 p-4 sm:p-5">
            <div className="flex items-center gap-2">
              <input
                value={section.title[lang] ?? ""}
                onChange={(e) => setSection(si, { title: text(section.title, e.target.value) })}
                placeholder={section.title[languages[0]] || t.builder.sectionTitle}
                aria-label={t.builder.sectionTitle}
                maxLength={80}
                className={`${smallInput} font-semibold`}
              />
              <button type="button" className={quietButton} aria-label={t.builder.up} disabled={si === 0} onClick={() => update(move(sections, si, -1))}>
                ↑
              </button>
              <button type="button" className={quietButton} aria-label={t.builder.down} disabled={si === sections.length - 1} onClick={() => update(move(sections, si, 1))}>
                ↓
              </button>
              <button type="button" className={quietButton} onClick={() => update(sections.filter((_, i) => i !== si))}>
                {t.builder.remove}
              </button>
            </div>

            {section.items.map((item, ii) => (
              <div key={item.id} className="space-y-3 rounded-2xl bg-stone-50 p-4">
                <div className="grid gap-2 sm:grid-cols-[1fr_8rem]">
                  <input
                    value={item.name[lang] ?? ""}
                    onChange={(e) => setItem(si, ii, { name: text(item.name, e.target.value) })}
                    placeholder={item.name[languages[0]] || t.builder.itemName}
                    aria-label={t.builder.itemName}
                    maxLength={80}
                    className={smallInput}
                  />
                  <input
                    value={item.price}
                    onChange={(e) => setItem(si, ii, { price: e.target.value })}
                    placeholder={t.builder.price}
                    aria-label={t.builder.price}
                    dir="ltr"
                    maxLength={20}
                    className={smallInput}
                  />
                </div>
                <textarea
                  value={item.description[lang] ?? ""}
                  onChange={(e) => setItem(si, ii, { description: text(item.description, e.target.value) })}
                  placeholder={item.description[languages[0]] || t.builder.description}
                  aria-label={t.builder.description}
                  maxLength={300}
                  rows={2}
                  className={smallInput}
                />
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  {item.photo ? (
                    <span className="flex items-center gap-2">
                      {/* eslint-disable-next-line @next/next/no-img-element -- user upload from Storage */}
                      <img src={publicFileUrl(SUPABASE_URL, item.photo)} alt="" className="h-12 w-12 rounded object-cover" />
                      <button type="button" className="text-stone-600 underline" onClick={() => setItem(si, ii, { photo: null })}>
                        {t.builder.removePhoto}
                      </button>
                    </span>
                  ) : (
                    <label className="cursor-pointer text-brand-700 underline">
                      {uploading === item.id ? t.upload.uploading : t.builder.photo}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="sr-only"
                        disabled={uploading !== null}
                        onChange={(e) => {
                          onPhoto(si, ii, e.target.files?.[0]);
                          e.target.value = "";
                        }}
                      />
                    </label>
                  )}
                  <details className="relative">
                    <summary className="cursor-pointer text-stone-700">
                      {t.builder.allergens}
                      {item.allergens.length > 0 && ` (${item.allergens.length})`}
                    </summary>
                    <div className="mt-2 grid grid-cols-2 gap-1 sm:grid-cols-3">
                      {ALLERGENS.map((allergen: Allergen) => (
                        <label key={allergen} className="flex items-center gap-1.5 text-stone-700">
                          <input
                            type="checkbox"
                            checked={item.allergens.includes(allergen)}
                            onChange={(e) =>
                              setItem(si, ii, {
                                allergens: e.target.checked ? [...item.allergens, allergen] : item.allergens.filter((a) => a !== allergen),
                              })
                            }
                            className="h-5 w-5 accent-brand-700"
                          />
                          {t.allergens[allergen]}
                        </label>
                      ))}
                    </div>
                  </details>
                  <span className="ms-auto flex gap-1">
                    <button type="button" className={quietButton} aria-label={t.builder.up} disabled={ii === 0} onClick={() => setSection(si, { items: move(section.items, ii, -1) })}>
                      ↑
                    </button>
                    <button
                      type="button"
                      className={quietButton}
                      aria-label={t.builder.down}
                      disabled={ii === section.items.length - 1}
                      onClick={() => setSection(si, { items: move(section.items, ii, 1) })}
                    >
                      ↓
                    </button>
                    <button type="button" className={quietButton} onClick={() => setSection(si, { items: section.items.filter((_, i) => i !== ii) })}>
                      {t.builder.remove}
                    </button>
                  </span>
                </div>
              </div>
            ))}
            <button type="button" className={quietButton} onClick={() => setSection(si, { items: [...section.items, emptyItem()] })}>
              + {t.builder.addItem}
            </button>
          </div>
        ))}
        <button type="button" className={quietButton} onClick={() => update([...sections, { id: newId(), title: {}, items: [emptyItem()] }])}>
          + {t.builder.addSection}
        </button>
      </fieldset>

      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={save} disabled={saving || locked || uploading !== null} className={buttonClass}>
          {saving ? t.builder.saving : t.builder.save}
        </button>
        {dirty && !status && <span className="text-sm text-amber-700">{t.builder.unsaved}</span>}
        {status && (
          <span role={status.ok ? "status" : "alert"} className={`text-sm ${status.ok ? "text-brand-700" : "text-red-700"}`}>
            {status.text}
          </span>
        )}
      </div>
    </div>
  );
}

const MENU_PACK_ITEMS = ["counter-stand", "table-tent", "window-sticker"] as const;

export function MenuPackPanel({
  title,
  shortUrl,
  color,
  allowed,
  t,
  designNames,
}: {
  title: string;
  shortUrl: string;
  color: string;
  allowed: PrintDesign[];
  t: MenuStrings;
  designNames: Record<PrintDesign, string>;
}) {
  const [design, setDesign] = useState<PrintDesign>(allowed[0]);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  async function generate() {
    setBusy(true);
    setFailed(false);
    try {
      const blob = await buildPrintPack({
        businessName: title,
        shortUrl,
        color,
        design,
        logo: null,
        text: t.print,
        items: MENU_PACK_ITEMS,
        stars: false,
        documentTitle: `${title} menu`,
      });
      downloadBlob(blob, `menu-${shortUrl.split("/").pop()}-${design}.pdf`);
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-bold text-stone-900">{t.pack.heading}</h2>
      <p className="text-[15px] text-stone-600">{t.pack.intro}</p>
      <div className="flex flex-wrap gap-2">
        {PRINT_DESIGNS.filter((d) => allowed.includes(d)).map((option) => (
          <label
            key={option}
            className={`flex cursor-pointer items-center gap-2 min-h-11 rounded-full border-[1.5px] px-4 py-2 text-[15px] font-medium ${
              design === option ? "border-brand-700 bg-brand-50 text-brand-800" : "border-stone-300 text-stone-700"
            }`}
          >
            <input type="radio" name="menu-design" checked={design === option} onChange={() => setDesign(option)} className="h-5 w-5 accent-brand-700" />
            {designNames[option]}
          </label>
        ))}
      </div>
      <button type="button" onClick={generate} disabled={busy} className={buttonClass}>
        {busy ? t.pack.generating : t.pack.generate}
      </button>
      {failed && (
        <p role="alert" className="text-sm text-red-700">
          {t.pack.failed}
        </p>
      )}
    </div>
  );
}
