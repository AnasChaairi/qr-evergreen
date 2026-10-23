"use client";

import { useActionState, useState, useTransition } from "react";
import { createKit, findBusiness, updateKitLinks, type KitActionState } from "@/app/[lang]/dashboard/review-kits/actions";
import type { DashboardStrings } from "@/content/dashboard";
import type { ReviewStrings } from "@/content/review";
import type { Locale } from "@/lib/i18n";
import { googleReviewUrl } from "@/lib/qr/payloads";
import { DEFAULT_BRAND_COLOR, EXTRA_PLATFORMS, type ExtraLink, type PrintDesign } from "@/lib/review/kit";
import { buildPrintPack } from "@/lib/review/printPack";
import { downloadBlob } from "@/lib/qr/render";
import type { PlaceResult } from "@/lib/review/places";

const inputClass = "field mt-2";
const buttonClass = "btn btn-primary";

type Errors = DashboardStrings["errors"] & ReviewStrings["errors"];
type Plain<T> = { [K in keyof T as T[K] extends (...args: never[]) => unknown ? never : K]: T[K] };
export type ReviewClientStrings = Omit<Plain<ReviewStrings>, "publicPage">;

function ErrorText({ state, errors }: { state: KitActionState; errors: Errors }) {
  if (!state?.error) return null;
  return (
    <p role="alert" className="text-sm text-red-700">
      {errors[state.error as keyof Errors] ?? errors.generic}
    </p>
  );
}

function ExtraFields({ t, values }: { t: ReviewClientStrings; values?: ExtraLink[] }) {
  return (
    <fieldset className="space-y-3">
      <legend className="text-[15px] font-semibold text-stone-800">{t.create.extras}</legend>
      <div className="grid gap-3 sm:grid-cols-2">
        {EXTRA_PLATFORMS.map((platform) => (
          <label key={platform} className="block text-sm text-stone-600">
            {t.platforms[platform]}
            <input
              name={`extra_${platform}`}
              inputMode="url"
              defaultValue={values?.find((v) => v.platform === platform)?.url ?? ""}
              className={inputClass}
            />
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function CreateKitForm({ locale, t, errors, disabled }: { locale: Locale; t: ReviewClientStrings; errors: Errors; disabled: boolean }) {
  const [state, action, pending] = useActionState(createKit, null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PlaceResult[] | null | "error" | undefined>(undefined);
  const [searching, startSearch] = useTransition();
  const [businessName, setBusinessName] = useState("");
  const [review, setReview] = useState("");

  function search() {
    startSearch(async () => setResults(await findBusiness(locale, query)));
  }

  return (
    <form action={action} className="space-y-5 card">
      <h2 className="text-xl font-bold text-stone-900">{t.create.heading}</h2>
      <input type="hidden" name="locale" value={locale} />

      <div>
        <label className="block text-[15px] font-semibold text-stone-800" htmlFor="place-search">
          {t.create.search}
        </label>
        <div className="flex gap-2">
          <input
            id="place-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                search();
              }
            }}
            placeholder={t.create.searchPlaceholder}
            className={inputClass}
          />
          <button type="button" onClick={search} disabled={searching || query.trim().length < 3} className={`${buttonClass} mt-1 shrink-0`}>
            {searching ? t.create.searching : t.create.searchButton}
          </button>
        </div>
        {results === null && <p className="mt-2 text-sm text-stone-600">{t.create.searchUnavailable}</p>}
        {results === "error" && <p className="mt-2 text-sm text-red-700">{errors.generic}</p>}
        {Array.isArray(results) && results.length === 0 && <p className="mt-2 text-sm text-stone-600">{t.create.noResults}</p>}
        {Array.isArray(results) && results.length > 0 && (
          <ul className="mt-3 divide-y divide-stone-200 overflow-hidden rounded-2xl border border-stone-200">
            {results.map((place) => (
              <li key={place.placeId} className="flex items-center justify-between gap-3 p-3">
                <span className="min-w-0">
                  <span className="block text-[17px] font-bold text-stone-900">{place.name}</span>
                  <span className="block truncate text-sm text-stone-500">{place.address}</span>
                </span>
                <button
                  type="button"
                  className="btn-link shrink-0 text-[15px]"
                  onClick={() => {
                    setBusinessName(place.name);
                    setReview(place.placeId);
                    setResults(undefined);
                  }}
                >
                  {t.create.choose}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
        <label className="block text-[15px] font-semibold text-stone-800">
          {t.create.businessName}
          <input name="businessName" required maxLength={80} value={businessName} onChange={(e) => setBusinessName(e.target.value)} className={inputClass} />
        </label>
        <label className="block text-[15px] font-semibold text-stone-800">
          {t.create.color}
          <input name="color" type="color" defaultValue={DEFAULT_BRAND_COLOR} className="mt-2 block h-12 w-20 cursor-pointer rounded-xl border-[1.5px] border-stone-300 bg-white p-1.5" />
        </label>
      </div>
      <label className="block text-[15px] font-semibold text-stone-800">
        {t.create.reviewLink}
        <input name="review" required value={review} onChange={(e) => setReview(e.target.value)} className={inputClass} />
        <span className="mt-1 block text-xs font-normal text-stone-500">{t.create.reviewLinkHelp}</span>
      </label>
      {review && /^[A-Za-z0-9_-]{16,}$/.test(review.trim()) && (
        <p className="text-xs text-stone-500">→ {googleReviewUrl(review.trim())}</p>
      )}
      <ExtraFields t={t} />
      <p className="rounded-2xl bg-stone-100 px-5 py-4 text-[15px] leading-relaxed text-stone-700">{t.noGating}</p>
      <ErrorText state={state} errors={errors} />
      <button type="submit" disabled={pending || disabled} className={buttonClass}>
        {t.create.submit}
      </button>
    </form>
  );
}

export function KitLinksForm({
  locale,
  id,
  review,
  extras,
  t,
  errors,
}: {
  locale: Locale;
  id: string;
  review: string;
  extras: ExtraLink[];
  t: ReviewClientStrings;
  errors: Errors;
}) {
  const [state, action, pending] = useActionState(updateKitLinks, null);
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="id" value={id} />
      <label className="block text-[15px] font-semibold text-stone-800">
        {t.create.reviewLink}
        <input name="review" required defaultValue={review} className={inputClass} />
      </label>
      <ExtraFields t={t} values={extras} />
      {state?.ok && <p className="text-sm text-brand-700">{t.kit.saved}</p>}
      <ErrorText state={state} errors={errors} />
      <button type="submit" disabled={pending} className={buttonClass}>
        {t.kit.save}
      </button>
    </form>
  );
}

export function PrintPackPanel({
  businessName,
  shortUrl,
  color,
  allowed,
  t,
  locale,
}: {
  businessName: string;
  shortUrl: string;
  color: string;
  allowed: PrintDesign[];
  t: ReviewClientStrings;
  locale: Locale;
}) {
  const all = Object.keys(t.kit.designs) as PrintDesign[];
  const [design, setDesign] = useState<PrintDesign>(allowed[0]);
  const [logo, setLogo] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  async function generate() {
    setBusy(true);
    setFailed(false);
    try {
      const blob = await buildPrintPack({ businessName, shortUrl, color, design, logo, text: t.print });
      const slug = shortUrl.split("/").pop();
      downloadBlob(blob, `review-kit-${slug}-${design}.pdf`);
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="space-y-4 card" lang={locale}>
      <h2 className="text-xl font-bold text-stone-900">{t.kit.pack}</h2>
      <p className="text-[15px] text-stone-600">{t.kit.packIntro}</p>
      <fieldset>
        <legend className="mb-3 text-[15px] font-semibold text-stone-800">{t.kit.design}</legend>
        <div className="flex flex-wrap gap-2">
          {all.map((option) => {
            const locked = !allowed.includes(option);
            return (
              <label
                key={option}
                className={`flex items-center gap-2 min-h-11 rounded-full border-[1.5px] px-4 py-2 text-[15px] font-medium ${
                  design === option ? "border-brand-700 bg-brand-50 text-brand-800" : "border-stone-300 text-stone-700"
                } ${locked ? "opacity-50" : "cursor-pointer"}`}
              >
                <input type="radio" name="design" value={option} checked={design === option} disabled={locked} onChange={() => setDesign(option)} className="h-5 w-5 accent-brand-700" />
                {t.kit.designs[option]}
                {locked && <span className="text-xs">({t.kit.lockedDesign})</span>}
              </label>
            );
          })}
        </div>
      </fieldset>
      <label className="block text-[15px] font-semibold text-stone-800">
        {t.kit.logo}
        <input
          type="file"
          accept="image/png,image/jpeg,image/svg+xml,image/webp"
          onChange={(e) => setLogo(e.target.files?.[0] ?? null)}
          className="mt-1 block text-sm file:me-3 file:min-h-11 file:cursor-pointer file:rounded-full file:border-0 file:bg-brand-50 file:px-5 file:py-2 file:text-[15px] file:font-semibold file:text-brand-800"
        />
      </label>
      <ul className="list-disc ps-5 text-sm text-stone-600">
        {(["counter-stand", "table-tent", "window-sticker", "receipt-card", "staff-badge"] as const).map((item) => (
          <li key={item}>{t.items[item]}</li>
        ))}
      </ul>
      <button type="button" onClick={generate} disabled={busy} className={buttonClass}>
        {busy ? t.kit.generating : t.kit.generate}
      </button>
      {failed && <p role="alert" className="text-sm text-red-700">{t.kit.failed}</p>}
    </section>
  );
}
