# Kloset — Agent Instructions

## Hard facts (read first, these override any docs)

- **Backend**: Express + **raw `pg`** + PostgreSQL + Cloudinary. **NOT Prisma. NOT Supabase.** Any doc that says otherwise (old handoff notes) is stale. Do not introduce an ORM.
- **Schema changes** go through numbered SQL migration files in `backend/db/` (`migration_001_...`, `migration_002_...`). Never run `backend/db/schema.legacy.sql` — it `DROP TABLE`s everything and recreates the OLD pre-migration taxonomy (no `colors[]`, no `sub_type`, old category list). It is kept only as historical reference.
- **Auth contract**: `Authorization: Bearer <token>`, built by the synchronous `getHeaders()` in `lib/api.ts`. The token is set via `setAuthToken()` from the Zustand store subscription, with a synchronous store-read fallback inside `getHeaders()`.
- **Hydration rule**: any `useEffect` that calls the API must gate on `hasHydrated && isAuthenticated` — never `isAuthenticated` alone. `hasHydrated` is deliberately excluded from persistence (`store/index.ts` `partialize`/`merge`) so it always starts false; see the sync effect in `app/_layout.tsx` for the reference pattern. Known gap: the effects in `app/(tabs)/discover.tsx` and `app/(tabs)/outfits.tsx` do not gate yet.
- **API base URL**: `EXPO_PUBLIC_API_URL` env var, falling back to the developer laptop's LAN IP in `lib/api.ts`. **Never `localhost`** — the app runs on a physical phone via Expo Go and `localhost` would point at the phone itself.
- **Secrets**: vision/AI keys, Cloudinary credentials, and `JWT_SECRET` live ONLY in `backend/.env` (gitignored; template in `backend/.env.example`). Nothing secret ever goes in the Expo app or `EXPO_PUBLIC_*` vars.

## Stack & layout

- **Frontend**: React Native via Expo SDK 54 (`expo ~54.0.35`), expo-router, Zustand (persisted to AsyncStorage). Screens in `app/`, tabs in `app/(tabs)/`.
- **Backend**: `backend/` — `server.js`, `routes/`, `controllers/`, `middleware/`, `config/db.js` (pg Pool). Image upload: multer memory buffer → Cloudinary stream → `secure_url` stored in Postgres.
- **Domain source of truth**: garment taxonomy and enums in `types/index.ts`; the 70+ named colour swatches (name/hex/family/undertone) in `constants/ColorPalette.ts`; the Indian occasion list in `app/upload.tsx` / `app/(tabs)/outfits.tsx`; occasion→formality mapping and the suggestion scoring SQL in `backend/controllers/outfitController.js`.

## Suggestion engines

Two engines, one designer brain. All styling knowledge (occasion→formality map, cultural colour rules, occasion style profiles with lanes/palette moods/practicality flags, colour-harmony helpers) lives in `backend/services/stylistRules.js` — never fork these rules into controllers.

**Owner's styling doctrine — keep Western and Indian etiquette separate.** "Guests can't wear red/white, don't upstage the bride" is Western wedding etiquette and must NOT be applied to Indian occasions: Indian weddings are maximalist, guests dress as richly as they want, in any colour including red. The only cultural colour veto is black for pooja/temple. Never add taste restrictions the user didn't ask for — the app collects preferences (coverage, colour comfort, style) and those are the only constraints on the user's own choices.

- **Closet-first** (`GET /suggestions/wardrobe`, `backend/services/outfitComposer.js`): composes complete outfits from the user's own wardrobe via templates (saree / lehenga / kurta-set / suit-set / fusion / dress / separates). Hard rules: formality band per occasion, coverage, cultural colour vetoes, pairing coherence (formality gap ≤1.6 keeps silk sarees away from sneakers; plain solid neutral basics are "chameleons" exempt from the gap), max one loud pattern, colour harmony (shared family or undertone). Soft scores: lane fit, palette mood, statement discipline, undertone, footwear lane/flats affinity, avoidHeavy practicality. Every outfit ships a 4–5 line explanation.
- **Catalog** (`GET /suggestions`, "ideas from outside"): SQL scoring over `outfit_catalog` — body shape (+3), skin tone (+3), undertone palette (+2), style (+2) — with the same hard filters, plus optional per-request `coverage`/`style` spec overrides.

Keep the split everywhere: filters are non-negotiable taste/culture rules; scores are preferences.

## Conventions

- Mobile ↔ API mapping: DB is snake_case, frontend is camelCase; convert in `lib/api.ts` mappers (`mapWardrobeItem`) and backend formatters (`formatOutfit`).
- New wardrobe/profile fields: add to `types/index.ts` → migration SQL → controller INSERT/UPDATE → `lib/api.ts` mapper + FormData → upload/profile UI. All five places, every time.
- Fashion decisions (taxonomy, palettes, occasion rules, catalog entries) are product decisions — make them with a stylist's judgment and leave a short `// why` note for anything non-obvious.
