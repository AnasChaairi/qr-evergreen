"use client";

import { useEffect } from "react";

// AdSense unit. Renders nothing until NEXT_PUBLIC_ADSENSE_CLIENT and the slot id
// are configured, so pages stay ad-free before AdSense approval.
// Placement rule: never between the user and the download button.

const CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

const SLOTS = {
  belowGenerator: process.env.NEXT_PUBLIC_ADSENSE_SLOT_BELOW_GENERATOR,
  inContent: process.env.NEXT_PUBLIC_ADSENSE_SLOT_IN_CONTENT,
  sidebar: process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR,
};

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

export function AdSlot({ placement, className = "" }: { placement: keyof typeof SLOTS; className?: string }) {
  const slot = SLOTS[placement];

  useEffect(() => {
    if (!CLIENT || !slot) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // Ad blockers throw here; the page works without ads.
    }
  }, [slot]);

  if (!CLIENT || !slot) return null;
  return (
    <div className={className} aria-label="Advertisement">
      <ins
        className="adsbygoogle block"
        data-ad-client={CLIENT}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
