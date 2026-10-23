"use client";

import { useEffect, useId, useMemo, useState, type ChangeEvent, type ReactNode } from "react";
import type { GeneratorStrings } from "@/content/ui";
import {
  CODE_TYPES,
  EMPTY_INPUT,
  encodePayload,
  type CodeType,
  type PayloadInput,
  type VcardInput,
} from "@/lib/qr/payloads";
import {
  DEFAULT_DESIGN,
  downloadBlob,
  hasGoodContrast,
  renderSvg,
  svgToBlob,
  svgToPdf,
  svgToPng,
  type Design,
} from "@/lib/qr/render";

const DOT_TYPES = ["square", "rounded", "dots", "classy", "extra-rounded"] as const;
const CORNER_TYPES = ["square", "extra-rounded", "dot"] as const;
const MAX_LOGO_BYTES = 2 * 1024 * 1024;

type Props = {
  t: GeneratorStrings;
  initialType: CodeType;
  // Tool pages show one type; the home page lets visitors switch.
  showTypeTabs?: boolean;
};

export function Generator({ t, initialType, showTypeTabs = false }: Props) {
  const [type, setType] = useState<CodeType>(initialType);
  const [input, setInput] = useState<PayloadInput>(EMPTY_INPUT);
  const [design, setDesign] = useState<Design>(() => ({
    ...DEFAULT_DESIGN,
    frame: { ...DEFAULT_DESIGN.frame, text: t.defaultFrameText[initialType] },
  }));
  const [svg, setSvg] = useState<string | null>(null);
  const [busy, setBusy] = useState<"png" | "svg" | "pdf" | null>(null);
  const [logoError, setLogoError] = useState(false);

  const encoded = useMemo(() => encodePayload(type, input[type]), [type, input]);
  const data = encoded.ok ? encoded.data : null;

  // Re-render shortly after the last change so typing stays smooth.
  useEffect(() => {
    if (!data) return;
    let cancelled = false;
    const timer = setTimeout(() => {
      renderSvg(data, design)
        .then((result) => !cancelled && setSvg(result))
        .catch(() => !cancelled && setSvg(null));
    }, 150);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [data, design]);

  const previewUrl = useMemo(() => (svg ? URL.createObjectURL(svgToBlob(svg)) : null), [svg]);
  useEffect(() => () => void (previewUrl && URL.revokeObjectURL(previewUrl)), [previewUrl]);

  const showPreview = Boolean(data && previewUrl);

  function switchType(next: CodeType) {
    setType(next);
    setSvg(null);
    // Swap the default call-to-action only if the user has not written their own.
    setDesign((d) =>
      d.frame.text === t.defaultFrameText[type]
        ? { ...d, frame: { ...d.frame, text: t.defaultFrameText[next] } }
        : d,
    );
  }

  function update<T extends CodeType>(codeType: T, patch: Partial<PayloadInput[T]>) {
    setInput((prev) => ({ ...prev, [codeType]: { ...prev[codeType], ...patch } }));
  }

  function onLogo(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.size > MAX_LOGO_BYTES) {
      setLogoError(true);
      return;
    }
    setLogoError(false);
    const reader = new FileReader();
    reader.onload = () => setDesign((d) => ({ ...d, logo: String(reader.result) }));
    reader.readAsDataURL(file);
  }

  async function download(format: "png" | "svg" | "pdf") {
    if (!data) return;
    setBusy(format);
    try {
      const current = await renderSvg(data, design);
      const blob =
        format === "svg" ? svgToBlob(current) : format === "png" ? await svgToPng(current) : await svgToPdf(current);
      downloadBlob(blob, `qr-evergreen-${type}.${format}`);
      window.plausible?.("Download", { props: { type, format } });
    } finally {
      setBusy(null);
    }
  }

  const goodContrast = hasGoodContrast(design.foreground, design.background);

  return (
    <div className="grid gap-6 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-6 lg:grid-cols-[1fr_320px]">
      <div className="min-w-0 space-y-6">
        {showTypeTabs && (
          <div role="tablist" aria-label="QR code type" className="flex flex-wrap gap-2">
            {CODE_TYPES.map((codeType) => (
              <button
                key={codeType}
                type="button"
                role="tab"
                aria-selected={codeType === type}
                onClick={() => switchType(codeType)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  codeType === type
                    ? "bg-brand-700 text-white"
                    : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                }`}
              >
                {t.typeLabels[codeType]}
              </button>
            ))}
          </div>
        )}

        <fieldset className="space-y-4">
          <legend className="sr-only">{t.typeLabels[type]}</legend>
          {type === "wifi" && (
            <>
              <TextField label={t.fields.ssid} value={input.wifi.ssid} onChange={(ssid) => update("wifi", { ssid })} />
              <div className="grid gap-4 sm:grid-cols-2">
                <SelectField
                  label={t.fields.security}
                  value={input.wifi.security}
                  onChange={(security) => update("wifi", { security: security as PayloadInput["wifi"]["security"] })}
                  options={(["WPA", "WEP", "nopass"] as const).map((v) => [v, t.fields.securityOptions[v]])}
                />
                {input.wifi.security !== "nopass" && (
                  <TextField
                    label={t.fields.password}
                    value={input.wifi.password}
                    onChange={(password) => update("wifi", { password })}
                    autoComplete="off"
                  />
                )}
              </div>
              <CheckboxField
                label={t.fields.hidden}
                checked={input.wifi.hidden}
                onChange={(hidden) => update("wifi", { hidden })}
              />
            </>
          )}
          {type === "url" && (
            <TextField
              label={t.fields.url}
              value={input.url.url}
              placeholder={t.fields.urlPlaceholder}
              inputMode="url"
              onChange={(url) => update("url", { url })}
            />
          )}
          {type === "whatsapp" && (
            <>
              <TextField
                label={t.fields.phone}
                value={input.whatsapp.phone}
                placeholder={t.fields.phonePlaceholder}
                inputMode="tel"
                onChange={(phone) => update("whatsapp", { phone })}
              />
              <TextAreaField
                label={t.fields.message}
                value={input.whatsapp.message}
                placeholder={t.fields.messagePlaceholder}
                onChange={(message) => update("whatsapp", { message })}
              />
            </>
          )}
          {type === "review" && (
            <TextField
              label={t.fields.review}
              value={input.review.placeIdOrUrl}
              placeholder={t.fields.reviewPlaceholder}
              help={t.fields.reviewHelp}
              onChange={(placeIdOrUrl) => update("review", { placeIdOrUrl })}
            />
          )}
          {type === "vcard" && (
            <div className="grid gap-4 sm:grid-cols-2">
              {(
                [
                  ["firstName", "text"],
                  ["lastName", "text"],
                  ["organization", "text"],
                  ["title", "text"],
                  ["phone", "tel"],
                  ["email", "email"],
                  ["website", "url"],
                  ["street", "text"],
                  ["city", "text"],
                  ["postalCode", "text"],
                  ["country", "text"],
                ] as const satisfies readonly (readonly [keyof VcardInput, string])[]
              ).map(([field, inputMode]) => (
                <TextField
                  key={field}
                  label={field === "phone" ? t.fields.vcardPhone : t.fields[field]}
                  value={input.vcard[field]}
                  inputMode={inputMode}
                  onChange={(value) => update("vcard", { [field]: value })}
                />
              ))}
            </div>
          )}
        </fieldset>

        <details className="group rounded-xl border border-stone-200 p-4" open>
          <summary className="cursor-pointer font-semibold text-stone-900">{t.design.heading}</summary>
          <div className="mt-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <ColorField
                label={t.design.foreground}
                value={design.foreground}
                onChange={(foreground) => setDesign((d) => ({ ...d, foreground }))}
              />
              <ColorField
                label={t.design.background}
                value={design.background}
                onChange={(background) => setDesign((d) => ({ ...d, background }))}
              />
              <SelectField
                label={t.design.dots}
                value={design.dotType}
                onChange={(dotType) => setDesign((d) => ({ ...d, dotType: dotType as Design["dotType"] }))}
                options={DOT_TYPES.map((v) => [v, t.design.dotOptions[v]])}
              />
              <SelectField
                label={t.design.corners}
                value={design.cornerType}
                onChange={(cornerType) =>
                  setDesign((d) => ({ ...d, cornerType: cornerType as Design["cornerType"] }))
                }
                options={CORNER_TYPES.map((v) => [v, t.design.cornerOptions[v]])}
              />
            </div>
            {!goodContrast && (
              <p role="alert" className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
                {t.design.contrastWarning}
              </p>
            )}
            <div>
              <span className="mb-1 block text-sm font-medium text-stone-700">{t.design.logo}</span>
              <div className="flex flex-wrap items-center gap-3">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml,image/webp"
                  onChange={onLogo}
                  aria-label={t.design.logo}
                  className="text-sm file:mr-3 file:rounded-full file:border-0 file:bg-stone-100 file:px-4 file:py-2 file:text-sm file:font-medium hover:file:bg-stone-200"
                />
                {design.logo && (
                  <button
                    type="button"
                    onClick={() => setDesign((d) => ({ ...d, logo: null }))}
                    className="text-sm text-stone-600 underline"
                  >
                    {t.design.logoRemove}
                  </button>
                )}
              </div>
              {logoError && <p className="mt-1 text-sm text-red-700">{t.design.logoTooLarge}</p>}
            </div>
            <CheckboxField
              label={t.design.frame}
              checked={design.frame.enabled}
              onChange={(enabled) => setDesign((d) => ({ ...d, frame: { ...d.frame, enabled } }))}
            />
            {design.frame.enabled && (
              <div className="grid gap-4 sm:grid-cols-3">
                <TextField
                  label={t.design.frameText}
                  value={design.frame.text}
                  maxLength={24}
                  onChange={(text) => setDesign((d) => ({ ...d, frame: { ...d.frame, text } }))}
                />
                <ColorField
                  label={t.design.frameColor}
                  value={design.frame.color}
                  onChange={(color) => setDesign((d) => ({ ...d, frame: { ...d.frame, color } }))}
                />
                <ColorField
                  label={t.design.frameTextColor}
                  value={design.frame.textColor}
                  onChange={(textColor) => setDesign((d) => ({ ...d, frame: { ...d.frame, textColor } }))}
                />
              </div>
            )}
          </div>
        </details>
      </div>

      <div className="space-y-4 lg:sticky lg:top-4 lg:self-start">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">{t.preview}</h2>
        <div className="flex aspect-square items-center justify-center rounded-xl bg-stone-50 p-4">
          {showPreview ? (
            // eslint-disable-next-line @next/next/no-img-element -- blob URL preview
            <img src={previewUrl!} alt={t.preview} className="max-h-full max-w-full" />
          ) : (
            <p className="px-6 text-center text-sm text-stone-500">
              {!encoded.ok && hasAnyInput(input[type]) ? t.errors[encoded.error] : t.previewEmpty}
            </p>
          )}
        </div>
        <div className="grid grid-cols-3 gap-2">
          {(["png", "svg", "pdf"] as const).map((format) => (
            <button
              key={format}
              type="button"
              disabled={!showPreview || busy !== null}
              onClick={() => download(format)}
              className="rounded-lg bg-brand-700 px-3 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-800 disabled:cursor-not-allowed disabled:bg-stone-300"
            >
              {busy === format ? t.downloading : format.toUpperCase()}
            </button>
          ))}
        </div>
        <p className="text-xs leading-relaxed text-stone-500">{t.privacyNote}</p>
      </div>
    </div>
  );
}

function hasAnyInput(value: object): boolean {
  return Object.values(value).some((v) => typeof v === "string" && v.trim() !== "");
}

function Field({ label, help, children }: { label: string; help?: string; children: (id: string) => ReactNode }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-stone-700">
        {label}
      </label>
      {children(id)}
      {help && <p className="mt-1 text-xs leading-relaxed text-stone-500">{help}</p>}
    </div>
  );
}

const inputClass =
  "block w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900 shadow-sm focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/20";

function TextField({
  label,
  value,
  onChange,
  help,
  ...rest
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  help?: string;
  placeholder?: string;
  inputMode?: "text" | "url" | "tel" | "email";
  autoComplete?: string;
  maxLength?: number;
}) {
  return (
    <Field label={label} help={help}>
      {(id) => (
        <input id={id} type="text" value={value} onChange={(e) => onChange(e.target.value)} className={inputClass} {...rest} />
      )}
    </Field>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <Field label={label}>
      {(id) => (
        <textarea
          id={id}
          rows={3}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={inputClass}
        />
      )}
    </Field>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: (readonly [string, string])[];
}) {
  return (
    <Field label={label}>
      {(id) => (
        <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className={inputClass}>
          {options.map(([optionValue, optionLabel]) => (
            <option key={optionValue} value={optionValue}>
              {optionLabel}
            </option>
          ))}
        </select>
      )}
    </Field>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <Field label={label}>
      {(id) => (
        <div className="flex items-center gap-2">
          <input
            id={id}
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="h-10 w-12 cursor-pointer rounded border border-stone-300 bg-white p-1"
          />
          <span className="font-mono text-sm text-stone-600">{value}</span>
        </div>
      )}
    </Field>
  );
}

function CheckboxField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-stone-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-stone-300 accent-brand-700"
      />
      {label}
    </label>
  );
}

declare global {
  interface Window {
    plausible?: (event: string, options?: { props?: Record<string, string> }) => void;
  }
}
