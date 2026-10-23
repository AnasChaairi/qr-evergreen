import Link from "next/link";
import type { ReactNode } from "react";
import { UI } from "@/content/ui";
import { TOOLS } from "@/content/tools";
import { LOCALES, pathFor, type Locale, type PageId } from "@/lib/i18n";
import { CODE_TYPES } from "@/lib/qr/payloads";
import { GlobeIcon, GridIcon, LogoutIcon, MenuIcon, StarIcon, WalletIcon } from "./Icons";
import { Logo } from "./Logo";

const prefix = (l: Locale) => (l === "fr" ? "/fr" : "");

function Brand({ locale, compact = false }: { locale: Locale; compact?: boolean }) {
  return (
    <Link href={pathFor(locale, "home")} className="flex shrink-0 items-center gap-2.5 text-stone-900">
      <Logo />
      <span className={`font-display text-lg font-bold tracking-tight sm:text-xl ${compact ? "hidden sm:inline" : ""}`}>{UI[locale].siteName}</span>
    </Link>
  );
}

function LanguageLink({ href, locale }: { href: string; locale: Locale }) {
  const other = LOCALES.find((l) => l !== locale)!;
  return (
    <Link
      href={href}
      hrefLang={other}
      lang={other}
      className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-stone-300 px-3.5 text-[15px] font-medium text-stone-800 hover:border-brand-700 hover:bg-brand-50"
    >
      <GlobeIcon className="h-4 w-4" />
      <span className="hidden sm:inline">{UI[locale].nav.switchLanguage}</span>
      <span className="sm:hidden" aria-hidden="true">{other.toUpperCase()}</span>
      <span className="sr-only sm:hidden">{UI[locale].nav.switchLanguage}</span>
    </Link>
  );
}

export function Header({ locale, page }: { locale: Locale; page: PageId }) {
  const ui = UI[locale];
  const other = LOCALES.find((l) => l !== locale)!;
  const navLink = "hidden min-h-11 items-center rounded-full px-3 text-[15px] font-medium text-stone-600 hover:bg-stone-100 hover:text-stone-900 sm:inline-flex";
  return (
    <header className="border-b border-stone-200 bg-white">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-10 focus:rounded-full focus:bg-white focus:px-4 focus:py-2">
        {ui.nav.skipToContent}
      </a>
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Brand locale={locale} />
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link href={`${pathFor(locale, "home")}#tools`} className={navLink}>
            {ui.nav.tools}
          </Link>
          <Link href={pathFor(locale, "pricing")} className={navLink} aria-current={page === "pricing" ? "page" : undefined}>
            {ui.nav.pricing}
          </Link>
          <LanguageLink href={pathFor(other, page)} locale={locale} />
          <Link href={`${prefix(locale)}/login`} className="btn btn-primary min-h-11 whitespace-nowrap px-4 text-[15px]">
            {ui.nav.signIn}
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function Footer({ locale }: { locale: Locale }) {
  const ui = UI[locale];
  return (
    <footer className="mt-20 bg-stone-900 text-stone-300">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-[1.4fr_1fr_1fr]">
        <div className="space-y-3">
          <div className="flex items-center gap-2.5 text-white">
            <Logo className="h-8 w-8" />
            <span className="font-display text-xl font-bold">{ui.siteName}</span>
          </div>
          <p className="max-w-sm text-[15px] leading-relaxed">{ui.footer.promise}</p>
        </div>
        <div>
          <h2 className="mb-3 font-sans text-[15px] font-bold tracking-normal text-white">{ui.footer.tools}</h2>
          <ul className="space-y-1 text-[15px]">
            {CODE_TYPES.map((type) => (
              <li key={type}>
                <Link href={pathFor(locale, type)} className="inline-flex min-h-9 items-center hover:text-white hover:underline">
                  {TOOLS[locale][type].h1}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="mb-3 font-sans text-[15px] font-bold tracking-normal text-white">{ui.footer.company}</h2>
          <ul className="space-y-1 text-[15px]">
            {(["pricing", "about", "contact", "privacy", "terms"] as const).map((page) => (
              <li key={page}>
                <Link href={pathFor(locale, page)} className="inline-flex min-h-9 items-center hover:text-white hover:underline">
                  {INFO_LABELS[locale][page]}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <p className="border-t border-white/10 py-6 text-center text-sm text-stone-400">
        © {new Date().getFullYear()} {ui.siteName}. {ui.footer.rights}
      </p>
    </footer>
  );
}

const INFO_LABELS: Record<Locale, Record<"pricing" | "about" | "contact" | "privacy" | "terms", string>> = {
  en: { pricing: "Pricing", about: "About", contact: "Contact", privacy: "Privacy", terms: "Terms" },
  fr: { pricing: "Tarifs", about: "À propos", contact: "Contact", privacy: "Confidentialité", terms: "Conditions" },
};

// Header for signed-in pages: the same brand, a tab for each area and sign out.
export function AppHeader({ locale, path, signedIn }: { locale: Locale; path: string; signedIn: boolean }) {
  const other = LOCALES.find((l) => l !== locale)!;
  const strings =
    locale === "fr"
      ? { dashboard: "Mes codes", reviewKits: "Kits avis", menus: "Menus", plan: "Mon offre", signOut: "Se déconnecter" }
      : { dashboard: "My codes", reviewKits: "Review kits", menus: "Menus", plan: "My plan", signOut: "Sign out" };
  const tabs: { href: string; label: string; icon: ReactNode }[] = [
    { href: "/dashboard", label: strings.dashboard, icon: <GridIcon className="h-5 w-5" /> },
    { href: "/dashboard/review-kits", label: strings.reviewKits, icon: <StarIcon className="h-5 w-5" /> },
    { href: "/dashboard/menus", label: strings.menus, icon: <MenuIcon className="h-5 w-5" /> },
    { href: "/dashboard/billing", label: strings.plan, icon: <WalletIcon className="h-5 w-5" /> },
  ];
  // The most specific tab that matches the current path is the active one.
  const active = tabs
    .filter((tab) => path === tab.href || path.startsWith(`${tab.href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;
  return (
    <header className="border-b border-stone-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Brand locale={locale} compact={signedIn} />
        <div className="flex items-center gap-2">
          <LanguageLink href={`${prefix(other)}${path}` || "/"} locale={locale} />
          {signedIn && (
            <form action={`/auth/signout?locale=${locale}`} method="post">
              <button type="submit" className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-[15px] font-medium text-stone-600 hover:bg-stone-100 hover:text-stone-900">
                <LogoutIcon className="h-4 w-4" />
                <span className="hidden sm:inline">{strings.signOut}</span>
                <span className="sr-only sm:hidden">{strings.signOut}</span>
              </button>
            </form>
          )}
        </div>
      </div>
      {signedIn && (
        <nav className="mx-auto max-w-6xl overflow-x-auto px-4 sm:px-6">
          <ul className="flex gap-1 pb-2">
            {tabs.map((tab) => (
              <li key={tab.href} className="shrink-0">
                <Link
                  href={`${prefix(locale)}${tab.href}`}
                  aria-current={tab.href === active ? "page" : undefined}
                  className={`inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-[15px] font-semibold transition-colors ${
                    tab.href === active ? "bg-brand-50 text-brand-800" : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
