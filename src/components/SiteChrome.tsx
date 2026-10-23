import Link from "next/link";
import { UI } from "@/content/ui";
import { TOOLS } from "@/content/tools";
import { LOCALES, pathFor, type Locale, type PageId } from "@/lib/i18n";
import { CODE_TYPES } from "@/lib/qr/payloads";
import { Logo } from "./Logo";

export function Header({ locale, page }: { locale: Locale; page: PageId }) {
  const ui = UI[locale];
  const other = LOCALES.find((l) => l !== locale)!;
  return (
    <header className="border-b border-stone-200 bg-white">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-10 focus:rounded focus:bg-white focus:px-3 focus:py-2">
        {ui.nav.skipToContent}
      </a>
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href={pathFor(locale, "home")} className="flex items-center gap-2 font-semibold text-stone-900">
          <Logo />
          <span>{ui.siteName}</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href={pathFor(locale, "pricing")} className="text-stone-600 hover:text-stone-900">
            {INFO_LABELS[locale].pricing}
          </Link>
          <Link href={pathFor(locale, "about")} className="hidden text-stone-600 hover:text-stone-900 sm:inline">
            {ui.nav.about}
          </Link>
          <Link
            href={pathFor(other, page)}
            hrefLang={other}
            lang={other}
            className="rounded-full border border-stone-300 px-3 py-1 text-stone-700 hover:bg-stone-100"
          >
            {ui.nav.switchLanguage}
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function Footer({ locale }: { locale: Locale }) {
  const ui = UI[locale];
  return (
    <footer className="mt-16 border-t border-stone-200 bg-stone-50">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3">
        <div className="space-y-3">
          <div className="flex items-center gap-2 font-semibold text-stone-900">
            <Logo className="h-6 w-6" />
            {ui.siteName}
          </div>
          <p className="text-sm leading-relaxed text-stone-600">{ui.footer.promise}</p>
        </div>
        <div>
          <h2 className="mb-3 text-sm font-semibold text-stone-900">{ui.footer.tools}</h2>
          <ul className="space-y-2 text-sm">
            {CODE_TYPES.map((type) => (
              <li key={type}>
                <Link href={pathFor(locale, type)} className="text-stone-600 hover:text-stone-900">
                  {TOOLS[locale][type].h1}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="mb-3 text-sm font-semibold text-stone-900">{ui.footer.company}</h2>
          <ul className="space-y-2 text-sm">
            {(["pricing", "about", "contact", "privacy", "terms"] as const).map((page) => (
              <li key={page}>
                <Link href={pathFor(locale, page)} className="text-stone-600 hover:text-stone-900">
                  {INFO_LABELS[locale][page]}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <p className="pb-8 text-center text-xs text-stone-500">
        © {new Date().getFullYear()} {ui.siteName}. {ui.footer.rights}
      </p>
    </footer>
  );
}

const INFO_LABELS: Record<Locale, Record<"pricing" | "about" | "contact" | "privacy" | "terms", string>> = {
  en: { pricing: "Pricing", about: "About", contact: "Contact", privacy: "Privacy", terms: "Terms" },
  fr: { pricing: "Tarifs", about: "À propos", contact: "Contact", privacy: "Confidentialité", terms: "Conditions" },
};

// Header for signed-in pages: same brand, a dashboard link and sign out.
export function AppHeader({ locale, path, signedIn }: { locale: Locale; path: string; signedIn: boolean }) {
  const ui = UI[locale];
  const other = LOCALES.find((l) => l !== locale)!;
  const strings =
    locale === "fr"
      ? { dashboard: "Codes", reviewKits: "Kits avis", menus: "Menus", plan: "Offre", signOut: "Se déconnecter" }
      : { dashboard: "Codes", reviewKits: "Review kits", menus: "Menus", plan: "Plan", signOut: "Sign out" };
  const prefix = (l: Locale) => (l === "fr" ? "/fr" : "");
  return (
    <header className="border-b border-stone-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href={pathFor(locale, "home")} className="flex shrink-0 items-center gap-2 font-semibold text-stone-900">
          <Logo />
          <span className="hidden sm:inline">{ui.siteName}</span>
        </Link>
        <nav className="flex flex-wrap items-center justify-end gap-x-4 gap-y-2 text-sm">
          {signedIn && (
            <>
              <Link href={`${prefix(locale)}/dashboard`} className="text-stone-600 hover:text-stone-900">
                {strings.dashboard}
              </Link>
              <Link href={`${prefix(locale)}/dashboard/review-kits`} className="text-stone-600 hover:text-stone-900">
                {strings.reviewKits}
              </Link>
              <Link href={`${prefix(locale)}/dashboard/menus`} className="text-stone-600 hover:text-stone-900">
                {strings.menus}
              </Link>
              <Link href={`${prefix(locale)}/dashboard/billing`} className="text-stone-600 hover:text-stone-900">
                {strings.plan}
              </Link>
              <form action={`/auth/signout?locale=${locale}`} method="post">
                <button type="submit" className="text-stone-600 hover:text-stone-900">
                  {strings.signOut}
                </button>
              </form>
            </>
          )}
          <Link
            href={`${prefix(other)}${path}` || "/"}
            hrefLang={other}
            lang={other}
            className="rounded-full border border-stone-300 px-3 py-1 text-stone-700 hover:bg-stone-100"
          >
            {ui.nav.switchLanguage}
          </Link>
        </nav>
      </div>
    </header>
  );
}
