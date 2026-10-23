"use client";

import { useEffect } from "react";

// Remembers in a cookie whether the signed-in user is on a paid plan, so the
// static tool pages can skip ads for them (paid plans have no ads).
export const PAID_COOKIE = "qre_paid";

export function PlanCookie({ paid }: { paid: boolean }) {
  useEffect(() => {
    document.cookie = paid ? `${PAID_COOKIE}=1; path=/; max-age=${60 * 60 * 24 * 30}; samesite=lax` : `${PAID_COOKIE}=; path=/; max-age=0`;
  }, [paid]);
  return null;
}
