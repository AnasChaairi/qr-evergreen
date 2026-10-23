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
    <div className="card space-y-5">
      <form onSubmit={sendLink} className="space-y-3">
        <label className="block text-[15px] font-semibold text-stone-800">
          {t.email}
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="field mt-2"
          />
        </label>
        <button
          type="submit"
          disabled={status === "sending"}
          className="btn btn-primary w-full"
        >
          {status === "sending" ? t.sending : t.sendLink}
        </button>
      </form>
      {status === "sent" && <p role="status" className="notice">{t.linkSent}</p>}
      {status === "error" && <p role="alert" className="notice-error">{t.error}</p>}
      <div className="flex items-center gap-3 text-sm text-stone-500">
        <span className="h-px flex-1 bg-stone-200" />
        {t.or}
        <span className="h-px flex-1 bg-stone-200" />
      </div>
      <button
        type="button"
        onClick={google}
        className="btn btn-secondary w-full"
      >
        {t.google}
      </button>
    </div>
  );
}
