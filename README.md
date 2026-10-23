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

## Project layout

- `src/lib/qr/payloads.ts`: turns form input into the text stored in each code type
- `src/lib/qr/frame.ts`: wraps the code with a quiet zone, frame and call to action
- `src/lib/qr/render.ts`: browser-only rendering and SVG/PNG/PDF export
- `src/content/`: all page copy, in English and French
- `src/app/[lang]/`: home page, tool pages and info pages

## Adding a tool page

1. Add the encoder and its tests in `src/lib/qr/payloads.ts`.
2. Add the slug for each language in `SLUGS` (`src/lib/i18n.ts`).
3. Write the page copy in `src/content/tools.en.ts` and `tools.fr.ts`.
4. Add the form fields and strings to the generator.
