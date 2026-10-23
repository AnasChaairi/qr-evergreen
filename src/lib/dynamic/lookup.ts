import "server-only";
import { unstable_cache } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

export type RedirectTarget = { id: string; destination: string; active: boolean };

export const codeTag = (slug: string) => `code:${slug}`;

const fetchTarget = (slug: string) =>
  unstable_cache(
    async (): Promise<RedirectTarget | null> => {
      const { data, error } = await createAdminClient()
        .from("qr_codes")
        .select("id, destination_url, is_active")
        .eq("short_slug", slug)
        .maybeSingle();
      if (error) throw error;
      return data ? { id: data.id, destination: data.destination_url, active: data.is_active } : null;
    },
    ["redirect-target", slug],
    { tags: [codeTag(slug)], revalidate: 300 },
  )();

// Last good answer per slug in this instance, used if the database is slow or
// down, so printed codes keep working through an outage.
const lastKnown = new Map<string, RedirectTarget>();
const LOOKUP_TIMEOUT_MS = 2500;

export async function lookupTarget(slug: string): Promise<RedirectTarget | null | "error"> {
  try {
    const target = await Promise.race([
      fetchTarget(slug),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error("lookup timeout")), LOOKUP_TIMEOUT_MS)),
    ]);
    if (target) {
      if (lastKnown.size > 10_000) lastKnown.clear();
      lastKnown.set(slug, target);
    }
    return target;
  } catch {
    return lastKnown.get(slug) ?? "error";
  }
}
