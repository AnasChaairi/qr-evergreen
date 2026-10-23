"use client";

import { useActionState, useEffect, useState } from "react";
import { createCode, updateDestination, type ActionState } from "@/app/[lang]/dashboard/actions";
import type { DashboardStrings } from "@/content/dashboard";
import type { Locale } from "@/lib/i18n";
import { DEFAULT_DESIGN, downloadBlob, renderSvg, svgToBlob, svgToPdf, svgToPng } from "@/lib/qr/render";

const inputClass =
  "block w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900 shadow-sm focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/20";
const buttonClass =
  "rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800 disabled:cursor-not-allowed disabled:bg-stone-300";

type Errors = DashboardStrings["errors"];

function ErrorText({ state, errors }: { state: ActionState; errors: Errors }) {
  if (!state?.error) return null;
  return (
    <p role="alert" className="text-sm text-red-700">
      {errors[state.error as keyof Errors] ?? errors.generic}
    </p>
  );
}

export function CreateCodeForm({
  locale,
  t,
  errors,
  disabled,
}: {
  locale: Locale;
  t: { newCode: string; name: string; namePlaceholder: string; destination: string; destinationPlaceholder: string; create: string };
  errors: Errors;
  disabled: boolean;
}) {
  const [state, action, pending] = useActionState(createCode, null);
  return (
    <form action={action} className="space-y-4 rounded-2xl border border-stone-200 bg-white p-4 sm:p-6">
      <h2 className="font-semibold text-stone-900">{t.newCode}</h2>
      <input type="hidden" name="locale" value={locale} />
      <div className="grid gap-4 sm:grid-cols-[1fr_2fr_auto] sm:items-end">
        <label className="block text-sm font-medium text-stone-700">
          {t.name}
          <input name="name" placeholder={t.namePlaceholder} maxLength={80} className={`${inputClass} mt-1`} />
        </label>
        <label className="block text-sm font-medium text-stone-700">
          {t.destination}
          <input name="destination" required placeholder={t.destinationPlaceholder} inputMode="url" className={`${inputClass} mt-1`} />
        </label>
        <button type="submit" disabled={pending || disabled} className={buttonClass}>
          {t.create}
        </button>
      </div>
      <ErrorText state={state} errors={errors} />
    </form>
  );
}

export function DestinationForm({
  locale,
  id,
  destination,
  t,
  errors,
}: {
  locale: Locale;
  id: string;
  destination: string;
  t: { destination: string; save: string; saved: string };
  errors: Errors;
}) {
  const [state, action, pending] = useActionState(updateDestination, null);
  return (
    <form action={action} className="space-y-2">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="id" value={id} />
      <label className="block text-sm font-medium text-stone-700">
        {t.destination}
        <div className="mt-1 flex flex-col gap-2 sm:flex-row">
          <input name="destination" required defaultValue={destination} inputMode="url" className={inputClass} />
          <button type="submit" disabled={pending} className={`${buttonClass} shrink-0`}>
            {t.save}
          </button>
        </div>
      </label>
      {state?.ok && <p className="text-sm text-brand-700">{t.saved}</p>}
      <ErrorText state={state} errors={errors} />
    </form>
  );
}

// Downloads the short link as a code, using the same renderer as the free tools.
export function ShortLinkDownload({ url, slug, label }: { url: string; slug: string; label: string }) {
  const [svg, setSvg] = useState<string | null>(null);
  useEffect(() => {
    renderSvg(url, DEFAULT_DESIGN).then(setSvg).catch(() => setSvg(null));
  }, [url]);
  const preview = svg ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}` : null;

  async function download(format: "png" | "svg" | "pdf") {
    if (!svg) return;
    const blob = format === "svg" ? svgToBlob(svg) : format === "png" ? await svgToPng(svg) : await svgToPdf(svg);
    downloadBlob(blob, `qr-evergreen-${slug}.${format}`);
  }

  return (
    <div className="space-y-3">
      <h2 className="font-semibold text-stone-900">{label}</h2>
      <div className="flex aspect-square w-48 items-center justify-center rounded-xl bg-white p-2">
        {/* eslint-disable-next-line @next/next/no-img-element -- generated preview */}
        {preview && <img src={preview} alt={label} className="max-h-full max-w-full" />}
      </div>
      <div className="flex gap-2">
        {(["png", "svg", "pdf"] as const).map((format) => (
          <button key={format} type="button" disabled={!svg} onClick={() => download(format)} className={buttonClass}>
            {format.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}
