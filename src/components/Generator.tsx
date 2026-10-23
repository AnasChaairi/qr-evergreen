"use client";

import { useEffect, useId, useMemo, useState, type ChangeEvent, type ReactNode } from "react";
import { ChevronDownIcon, DownloadIcon, ImageIcon, LockIcon, TYPE_ICONS } from "./Icons";
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
// Dark, high-contrast colours that always scan well.
const SWATCHES = ["#12261d", "#0f6b45", "#1f4e86", "#6a2c5b", "#a2401f"] as const;

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
  const uid = useId();

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
  const TypeIcon = TYPE_ICONS[type];

  return (
    <div className="flex flex-wrap overflow-hidden rounded-[28px] border border-stone-200 bg-white shadow-soft">
      <div className="min-w-0 flex-[999_1_540px] space-y-9 p-5 sm:p-8">
        {showTypeTabs && (
          <Step number={1} title={t.steps.pick}>
            <div role="radiogroup" aria-label={t.steps.pick} className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {CODE_TYPES.map((codeType) => {
                const Icon = TYPE_ICONS[codeType];
                const selected = codeType === type;
                return (
                  <button
                    key={codeType}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => switchType(codeType)}
                    className={`flex min-h-28 flex-col items-start gap-1.5 rounded-2xl border-2 p-4 text-start transition ${
                      selected
                        ? "border-brand-700 bg-brand-50 ring-4 ring-brand-700/10"
                        : "border-stone-200 bg-white hover:border-brand-600 hover:bg-stone-50"
                    }`}
                  >
                    <Icon className="h-7 w-7 text-brand-700" />
                    <span className="text-base font-bold text-stone-900">{t.typeLabels[codeType]}</span>
                    <span className="text-[13px] leading-snug text-stone-600">{t.typeHints[codeType]}</span>
                  </button>
                );
              })}
            </div>
          </Step>
        )}

        <Step number={showTypeTabs ? 2 : 1} title={t.steps.fill[type]} icon={showTypeTabs ? undefined : <TypeIcon className="h-6 w-6" />}>
          <fieldset className="space-y-5">
            <legend className="sr-only">{t.typeLabels[type]}</legend>
            {type === "wifi" && (
              <>
                <div className="grid gap-5 sm:grid-cols-2">
                  <TextField label={t.fields.ssid} value={input.wifi.ssid} onChange={(ssid) => update("wifi", { ssid })} />
                  {input.wifi.security !== "nopass" && (
                    <TextField
                      label={t.fields.password}
                      value={input.wifi.password}
                      onChange={(password) => update("wifi", { password })}
                      autoComplete="off"
                    />
                  )}
                </div>
                <p className="flex gap-2 rounded-xl bg-sun-100 px-4 py-3 text-sm leading-relaxed text-sun-900">{t.wifiHint}</p>
                <div className="grid gap-5 sm:grid-cols-2 sm:items-end">
                  <SelectField
                    label={t.fields.security}
                    value={input.wifi.security}
                    onChange={(security) => update("wifi", { security: security as PayloadInput["wifi"]["security"] })}
                    options={(["WPA", "WEP", "nopass"] as const).map((v) => [v, t.fields.securityOptions[v]])}
                  />
                  <CheckboxField
                    label={t.fields.hidden}
                    checked={input.wifi.hidden}
                    onChange={(hidden) => update("wifi", { hidden })}
                  />
                </div>
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
              <div className="grid gap-5 sm:grid-cols-2">
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
        </Step>

        <Step number={showTypeTabs ? 3 : 2} title={t.steps.style} note={t.steps.optional}>
          <div className="space-y-6">
            <div>
              <span id={`${uid}-colour`} className="label">
                {t.design.foreground}
              </span>
              <div role="radiogroup" aria-labelledby={`${uid}-colour`} className="flex flex-wrap items-center gap-3">
                {SWATCHES.map((colour) => (
                  <button
                    key={colour}
                    type="button"
                    role="radio"
                    aria-checked={design.foreground === colour}
                    aria-label={colour}
                    onClick={() => setDesign((d) => ({ ...d, foreground: colour, frame: { ...d.frame, color: colour } }))}
                    className={`h-11 w-11 rounded-full border-[3px] border-white transition ${
                      design.foreground === colour ? "ring-[3px] ring-stone-900" : "ring-[1.5px] ring-stone-300 hover:ring-stone-500"
                    }`}
                    style={{ backgroundColor: colour }}
                  />
                ))}
                <label className="relative inline-flex h-11 cursor-pointer items-center gap-2 rounded-full border-[1.5px] border-dashed border-stone-300 px-3 text-sm font-semibold text-stone-700 hover:border-brand-700">
                  <span className="h-6 w-6 rounded-full border border-stone-300" style={{ backgroundColor: design.foreground }} />
                  {t.design.custom}
                  <input
                    type="color"
                    value={design.foreground}
                    onChange={(e) => {
                      const foreground = e.target.value;
                      setDesign((d) => ({ ...d, foreground }));
                    }}
                    className="absolute inset-0 cursor-pointer opacity-0"
                  />
                </label>
              </div>
            </div>

            <div className="space-y-4">
              <CheckboxField
                label={t.design.frame}
                checked={design.frame.enabled}
                onChange={(enabled) => setDesign((d) => ({ ...d, frame: { ...d.frame, enabled } }))}
              />
              {design.frame.enabled && (
                <TextField
                  label={t.design.frameText}
                  value={design.frame.text}
                  maxLength={24}
                  onChange={(text) => setDesign((d) => ({ ...d, frame: { ...d.frame, text } }))}
                />
              )}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-3">
                <label className="btn btn-secondary cursor-pointer border-dashed focus-within:ring-4 focus-within:ring-brand-700/20">
                  <ImageIcon className="h-5 w-5" />
                  {t.design.logo}
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/svg+xml,image/webp"
                    onChange={onLogo}
                    className="sr-only"
                  />
                </label>
                {design.logo && (
                  <button type="button" onClick={() => setDesign((d) => ({ ...d, logo: null }))} className="btn-link text-[15px]">
                    {t.design.logoRemove}
                  </button>
                )}
              </div>
              {logoError && <p className="mt-2 text-sm text-red-700">{t.design.logoTooLarge}</p>}
            </div>

            {!goodContrast && (
              <p role="alert" className="notice-warn">
                {t.design.contrastWarning}
              </p>
            )}

            <details className="group border-t border-stone-200 pt-4">
              <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 font-semibold text-brand-700 [&::-webkit-details-marker]:hidden">
                <ChevronDownIcon className="h-5 w-5 transition-transform group-open:rotate-180" />
                {t.moreOptions}
              </summary>
              <div className="mt-4 grid gap-5 sm:grid-cols-2">
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
            </details>
          </div>
        </Step>
      </div>

      <div className="min-w-0 flex-[1_1_320px] bg-stone-100 p-5 sm:p-8">
        <div className="space-y-4 lg:sticky lg:top-6">
          <h2 className="flex items-center gap-2 font-sans text-sm font-semibold tracking-normal text-stone-600">
            <span className={`h-2 w-2 rounded-full ${showPreview ? "bg-brand-500" : "bg-stone-400"}`} />
            {t.preview}
          </h2>
          <div className="flex aspect-square items-center justify-center rounded-3xl bg-white p-5 shadow-soft">
            {showPreview ? (
              // eslint-disable-next-line @next/next/no-img-element -- blob URL preview
              <img src={previewUrl!} alt={t.preview} className="max-h-full max-w-full" />
            ) : (
              <p className="px-6 text-center text-[15px] leading-relaxed text-stone-500">
                {!encoded.ok && hasAnyInput(input[type]) ? t.errors[encoded.error] : t.previewEmpty}
              </p>
            )}
          </div>
          <button
            type="button"
            disabled={!showPreview || busy !== null}
            onClick={() => download("pdf")}
            className="btn btn-primary min-h-14 w-full rounded-2xl text-lg"
          >
            <DownloadIcon className="h-5 w-5" />
            {busy === "pdf" ? t.downloading : t.downloadPrint}
          </button>
          <div className="grid grid-cols-2 gap-3">
            {(["png", "svg"] as const).map((format) => (
              <button
                key={format}
                type="button"
                disabled={!showPreview || busy !== null}
                onClick={() => download(format)}
                className="btn btn-secondary w-full rounded-2xl"
              >
                {busy === format ? t.downloading : format.toUpperCase()}
              </button>
            ))}
          </div>
          <p className="text-[13px] leading-relaxed text-stone-600">{t.printNote}</p>
          <p className="flex gap-2 text-[13px] leading-relaxed text-stone-600">
            <LockIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand-700" />
            {t.privacyNote}
          </p>
        </div>
      </div>
    </div>
  );
}

function Step({
  number,
  title,
  note,
  icon,
  children,
}: {
  number: number;
  title: string;
  note?: string;
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="space-y-4">
      <h2 className="flex flex-wrap items-center gap-3 text-xl font-bold text-stone-900 sm:text-[22px]">
        <span aria-hidden="true" className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-900 font-sans text-base text-sun-300">
          {icon ?? number}
        </span>
        {title}
        {note && <span className="font-sans text-[15px] font-medium tracking-normal text-stone-500">{note}</span>}
      </h2>
      {children}
    </section>
  );
}

function hasAnyInput(value: object): boolean {
  return Object.values(value).some((v) => typeof v === "string" && v.trim() !== "");
}

function Field({ label, help, children }: { label: string; help?: string; children: (id: string) => ReactNode }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="label">
        {label}
      </label>
      {children(id)}
      {help && <p className="hint">{help}</p>}
    </div>
  );
}

const inputClass = "field";

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
        <div className="flex min-h-12 items-center gap-3 rounded-xl border-[1.5px] border-stone-300 bg-white px-2">
          <input
            id={id}
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="h-9 w-11 cursor-pointer rounded-lg border-0 bg-transparent p-0"
          />
          <span className="font-mono text-sm uppercase text-stone-600">{value}</span>
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
    <label className="flex min-h-12 cursor-pointer items-center gap-3 text-base font-medium text-stone-800">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-6 w-6 shrink-0 cursor-pointer rounded-md accent-brand-700"
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
