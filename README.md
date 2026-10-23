# QR Evergreen

Honest QR codes for everyone and for local businesses. Free codes never die: static codes hold their data inside the pattern, so they keep working even if the site disappears.

This repo holds the website at qrevergreen.com. The MVP is the free generator: WiFi, link, WhatsApp, Google review and vCard codes, with colours, logo, frame and PNG/SVG/PDF download, all rendered in the browser.

## Stack

- Next.js (App Router) and Tailwind CSS, tool pages statically generated
- `qr-code-styling` for drawing codes, `pdf-lib` for PDF export
- English at `/`, French under `/fr/` with translated slugs (`src/proxy.ts` rewrites root URLs to the internal `/en` route)
- Vitest for unit tests, Playwright for the end-to-end smoke test

## Getting started

```bash
npm install
cp .env.example .env.local   # optional settings
npm run dev
```

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Local dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | Generate route types and run `tsc` |
| `npm test` | Unit tests (payload encoders, frame layout, URLs) |
| `npm run test:e2e` | Playwright smoke test against a production build |
| `npm run test:db` | Applies the migrations to a scratch Postgres and runs the row-level security tests (needs `DATABASE_URL`) |

## Project layout

- `src/lib/qr/payloads.ts`: turns form input into the text stored in each code type
- `src/lib/qr/frame.ts`: wraps the code with a quiet zone, frame and call to action
- `src/lib/qr/render.ts`: browser-only rendering and SVG/PNG/PDF export
- `src/content/`: all page copy, in English and French
- `src/app/[lang]/`: home page, tool pages and info pages

## Accounts and dynamic codes (Supabase)

Dynamic codes point at a short link (`/q/{slug}`, or a short domain set in `NEXT_PUBLIC_SHORT_URL`). The redirect in `src/app/q/[slug]/route.ts` answers from cache, keeps the last good destination if the database is down, and logs the scan after responding. Billing never affects it: a code stops redirecting only if its owner archives it.

Setup:

1. Create a Supabase project and apply `supabase/migrations` (`supabase db push`, or paste the SQL in the SQL editor).
2. In Authentication → URL configuration, set the site URL and add `https://<your-domain>/auth/callback` (and `http://localhost:3000/auth/callback` for local work) to the redirect URLs.
3. Enable the Google provider if you want Google sign-in.
4. Fill in the Supabase, Safe Browsing and `SCAN_HASH_SALT` variables from `.env.example`.

Scans are partitioned by month. The migration creates partitions for the next 12 months plus a default partition, so inserts never fail; schedule `select public.ensure_scans_partition((now() + interval '1 month')::date);` monthly (for example with `pg_cron`) to keep creating them.

## Review QR kit

Owners find their business with the Places API (`GOOGLE_PLACES_API_KEY`, signed-in users only) or paste a review link, and get one dynamic code. With no extra platforms it opens Google's review form directly; with TripAdvisor, Facebook, Trustpilot or Booking links it opens `/r/{slug}`, a page with no ads that shows every visitor the same links (no review gating). The print pack (`src/lib/review/printPack.ts`) is built in the browser with pdf-lib: counter stand, table tent, window sticker, receipt card and staff badge, each with its own `?s=` tag so the dashboard shows scans per printed item.

## Adding a tool page

1. Add the encoder and its tests in `src/lib/qr/payloads.ts`.
2. Add the slug for each language in `SLUGS` (`src/lib/i18n.ts`).
3. Write the page copy in `src/content/tools.en.ts` and `tools.fr.ts`.
4. Add the form fields and strings to the generator.
