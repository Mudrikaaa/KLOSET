<div align="center">

# <img width="24" height="24" alt="Kloset logo" src="https://github.com/user-attachments/assets/8bded46c-fa6b-4c0b-bba3-8627b66e3925" /> KLOSET

### Your AI-powered personal stylist, built for Indian occasions

Digitize your wardrobe with AI garment tagging, then get complete outfits composed from the clothes you already own — for everything from a Monday standup to a Sangeet night.

![Expo](https://img.shields.io/badge/Expo_SDK_54-000020?style=for-the-badge&logo=expo&logoColor=white)
![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)

</div>

---

## What it is

**Kloset** answers the question every wardrobe owner asks daily: *"what do I wear for ___?"* — but answers it from **your own closet first**.

1. **Snap a garment** → a vision model (Gemini Flash) pre-fills the tagging form: category, sub-type, colours (from a 74-swatch palette), fabric, fit, pattern, neckline, craft (zardozi, gota patti, bandhani…), opacity. You confirm in seconds instead of filling 12 dropdowns. If the AI is down, manual entry works exactly as before — the AI is an accelerator, never a dependency.
2. **Pick an occasion** — searchable, 47 of them, from *Pooja / Temple Visit* to *Cocktail / Pre-wedding* to *Job Interview (Tech)*.
3. **Get complete outfits composed from your wardrobe**, each with a short stylist's note explaining *why*: why it fits the occasion's register, why the colours flatter your undertone and skin tone, why the silhouette works for your body shape.
4. Optionally **browse curated "ideas from outside"** — a hand-tagged catalog of 33 looks — with per-request preferences (coverage, style lane) that don't touch your saved profile.

## Why Indian-first styling is the hard part (and the point)

Most outfit apps are built on Western occasion grammar: brunch, date night, office. Indian dressing runs on a second, richer grammar that generic apps get wrong:

- **Occasions are cultural contracts.** A *Mehendi* means greens and yellows in light fabrics with flats — because henna-wet hands can't manage straps and you're seated on the floor for hours. A *Sangeet* means metallics and mirror-work that can dance. *Cocktail* has become the indo-western room: liquid-metal gowns and sharara-with-halter fusion sit beside western dresses as equals.
- **Weddings are maximalist.** Kloset deliberately does **not** import Western wedding etiquette ("guests can't wear red/white, don't upstage the bride"). At an Indian wedding, guests celebrate at full volume — reds, golds, heirloom-level embellishment. The only cultural colour rule the engine enforces is avoiding black for pooja/temple visits.
- **The taxonomy must speak the language.** The garment model knows *Anarkali* from *Straight Kurta*, *Sharara* from *Gharara*, *Juttis* from *Kolhapuris*, and treats *Bandhani* as the resist-dye pattern it is — not "Printed".
- **Pairing rules are stylist rules.** A formality-coherence check keeps silk sarees away from sneakers; plain neutral basics are treated as "chameleons" that adapt to the statement piece; one loud pattern per outfit; colours must share a family or undertone.

The engine's architecture mirrors how a working stylist thinks: **hard rules** (occasion formality band, the user's coverage preference, cultural vetoes, pairing coherence) are non-negotiable; **soft scores** (style lane, palette mood, undertone flattery) rank what survives. Preferences rank — they never veto.

## Screenshots

<!-- Drop screenshots into assets/screenshots/ and update the paths below -->
| Wardrobe | AI tagging | Occasion stylist | Outfit + why |
|---|---|---|---|
| ![Wardrobe](assets/screenshots/wardrobe.png) | ![Upload](assets/screenshots/upload.png) | ![Occasions](assets/screenshots/occasions.png) | ![Outfit](assets/screenshots/outfit.png) |

## Stack

| Layer | Tech |
|---|---|
| Mobile app | React Native (Expo SDK 54), expo-router, TypeScript, Zustand (persisted to AsyncStorage) |
| API | Node.js + Express, JWT auth (bcrypt), raw `pg` — no ORM by design |
| Database | PostgreSQL — numbered SQL migrations, idempotent seeds |
| Images | Cloudinary (multer memory buffer → upload stream → `secure_url`) |
| Vision AI | Gemini Flash via a single swappable service module (`backend/services/visionService.js`) — provider can change in one file; API key lives only on the backend |
| Styling brain | `backend/services/stylistRules.js` (occasion profiles, palette moods, cultural rules) + `backend/services/outfitComposer.js` (closet-first outfit composition) |

### Engineering details worth a look

- **Enum-locked AI**: the vision prompt's allowed values are parsed from the app's real TypeScript unions and colour palette at server start, so the model can't invent an option the form doesn't have — and every response is re-validated server-side, because LLM output is untrusted input.
- **Hydration-safe auth**: Zustand rehydration races are handled with a `hasHydrated` gate that is deliberately excluded from persistence; every API-calling effect waits for it.
- **Idempotent data layer**: `node backend/scripts/setup_db.js` builds a fresh database (bootstrap → migrations → seed) or safely no-ops on an existing one.

## Run it locally

```bash
# Backend
cd backend
cp .env.example .env        # fill in Postgres URL, JWT secret, Cloudinary, Gemini key
npm ci
npm run setup-db            # bootstrap + migrations + 33-outfit seed (idempotent)
npm run dev                 # http://localhost:5000/health

# App (repo root) — phone and laptop on the same Wi-Fi
echo EXPO_PUBLIC_API_URL=http://<your-laptop-LAN-IP>:5000 > .env.local
npm install
npx expo start              # scan the QR with Expo Go
```

> The API URL must be your laptop's LAN IP, never `localhost` — the app runs on a physical phone, where `localhost` points at the phone itself.

## Deploy

- **Backend → Render**: the repo ships a [`render.yaml`](render.yaml) blueprint (web service + managed Postgres). Create a Blueprint in the Render dashboard, paste the five secrets when prompted, then run `npm run setup-db` once in the service shell.
- **APK → EAS**: [`eas.json`](eas.json)'s `preview` profile builds a shareable APK with the deployed API URL baked in: `eas build -p android --profile preview`.

## A note on outfit imagery

The curated catalog uses editorial photography hot-linked from [Unsplash](https://unsplash.com) under the Unsplash License. Every image was resolution-checked and visually reviewed so that each outfit's description and styling notes describe what is actually in the photo — but these are illustrative stand-ins, not commissioned lookbook shoots. Wardrobe photos are the user's own, stored on their Cloudinary account. A production release would replace catalog imagery with licensed or original photography.

---

<div align="center">
Made with a stylist's eye and an engineer's paranoia.
</div>
