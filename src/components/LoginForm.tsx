"use client";

import { useState, type FormEvent } from "react";
import type { DashboardStrings } from "@/content/dashboard";
import type { Locale } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/browser";

export function LoginForm({ locale, t, initialError }: { locale: Locale; t: DashboardStrings["login"]; initialError: boolean }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(initialError ? "error" : "idle");
  const next = locale === "fr" ? "/fr/dashboard" : "/dashboard";
  const redirectTo = () => `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;

  async function sendLink(event: FormEvent) {
    event.preventDefault();
    setStatus("sending");
    const { error } = await createClient().auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo(), data: { locale } },
    });
    setStatus(error ? "error" : "sent");
  }

  async function google() {
    const { error } = await createClient().auth.signInWithOAuth({ provider: "google", options: { redirectTo: redirectTo() } });
    if (error) setStatus("error");
  }

  return (
    <div className="space-y-4 rounded-2xl border border-stone-200 bg-white p-6">
      <form onSubmit={sendLink} className="space-y-3">
        <label className="block text-sm font-medium text-stone-700">
          {t.email}
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 shadow-sm focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/20"
          />
        </label>
        <button
          type="submit"
          disabled={status === "sending"}
          className="w-full rounded-lg bg-brand-700 px-4 py-2 font-semibold text-white hover:bg-brand-800 disabled:bg-stone-300"
        >
          {status === "sending" ? t.sending : t.sendLink}
        </button>
      </form>
      {status === "sent" && <p className="text-sm text-brand-700">{t.linkSent}</p>}
      {status === "error" && <p role="alert" className="text-sm text-red-700">{t.error}</p>}
      <div className="flex items-center gap-3 text-xs uppercase text-stone-400">
        <span className="h-px flex-1 bg-stone-200" />
        {t.or}
        <span className="h-px flex-1 bg-stone-200" />
      </div>
      <button
        type="button"
        onClick={google}
        className="w-full rounded-lg border border-stone-300 px-4 py-2 font-medium text-stone-800 hover:bg-stone-50"
      >
        {t.google}
      </button>
    </div>
  );
}
