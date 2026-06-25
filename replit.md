# Mystique Compass

A numerology + psychomatrix + astrology profile generator app that gives your life a meaning.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080, proxied at `/api`)
- `pnpm --filter @workspace/mystique run dev` — run the Mystique Compass front-end (port 24479, proxied at `/`)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `SESSION_SECRET` — session secret for Express

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5 (`artifacts/api-server`)
- Front-end: React + Vite (`artifacts/mystique`)
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)
- Charting: Chart.js + react-chartjs-2
- 3D: three.js
- PDF export: jsPDF

## Where things live

- `artifacts/mystique/src/lib/numerology.ts` — core numerology calculation engine
- `artifacts/mystique/src/lib/astrology.ts` — astrology / zodiac calculations
- `artifacts/mystique/src/components/profile-generator/` — main profile orchestrator + display tabs
- `artifacts/mystique/src/components/profile-generator/numerology-display.tsx` — Lo Shu grid + numerology output
- `artifacts/mystique/src/components/profile-generator/psychomatrix-display.tsx` — psychomatrix grid display
- `artifacts/mystique/src/components/profile-generator/results-display.tsx` — tabbed results page (numerology / psychomatrix / astro / cosmic fate)
- `artifacts/api-server/src/routes/biography.ts` — Wikipedia biography proxy (`GET /api/biography?name=...`)

## Architecture decisions

- Firebase is stubbed to null exports — all profile data is computed client-side with no backend persistence required.
- The `/api/biography` endpoint proxies Wikipedia's public API to work around browser CORS restrictions.
- Service worker registration is removed from `main.tsx` to avoid console errors (no SW file bundled).
- All numerology and psychomatrix calculations are pure functions in `src/lib/` — no network calls required for the core profile generation.
- `results-display.tsx` exceeds 500 KB (Babel deopt warning is harmless) — it's intentionally monolithic to avoid prop-drilling across many deeply nested tab components.

## Product

- Enter any person's name + birth date + gender (or search Wikipedia for a famous person)
- Generates a full numerology profile (Lo Shu grid, life path, destiny, soul urge, personality numbers)
- Generates a full psychomatrix (Pythagoras square) with detailed interpretations
- Generates Western + new-era astrology profiles
- Generates a Cosmic Fate Map with animal sign, elemental data, and synthesis insights
- Cheiro alert engine highlights climacteric years and lucky days from the person's Psychic number
- PDF export and PWA install support

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Do not run `pnpm dev` at the workspace root — run with `--filter` targeting a specific artifact.
- `results-display.tsx` is intentionally large (500 KB+); Babel's deopt warning is expected and harmless.
- The front-end calls `/api/biography?name=...` — this must be served by the api-server, not the Vite dev server.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
