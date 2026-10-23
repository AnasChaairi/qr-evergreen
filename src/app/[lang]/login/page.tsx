import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { LoginForm } from "@/components/LoginForm";
import { AppHeader } from "@/components/SiteChrome";
import { DASHBOARD } from "@/content/dashboard";
import { isLocale } from "@/lib/i18n";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata({ params }: PageProps<"/[lang]/login">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return { title: DASHBOARD[lang].login.metaTitle, robots: { index: false } };
}

export default async function LoginPage({ params, searchParams }: PageProps<"/[lang]/login">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = DASHBOARD[lang].login;
  const configured = isSupabaseConfigured();

  if (configured) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) redirect(lang === "fr" ? "/fr/dashboard" : "/dashboard");
  }

  const { error } = await searchParams;
  return (
    <>
      <AppHeader locale={lang} path="/login" signedIn={false} />
      <main id="main" className="mx-auto w-full max-w-md flex-1 space-y-6 px-4 py-12">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-stone-900">{t.h1}</h1>
          <p className="text-stone-600">{t.intro}</p>
        </div>
        {configured ? <LoginForm locale={lang} t={t} initialError={Boolean(error)} /> : <p>{t.notConfigured}</p>}
      </main>
    </>
  );
}
