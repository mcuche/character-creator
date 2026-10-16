# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A web application for creating and managing characters for the **Dragonbane RPG** (Free League Publishing). The app covers character creation (multi-step wizard) and character sheet view. `DESIGN.md` is the canonical design document. `rules.md` contains the full game rules reference.

## Commands

All commands run from `dragonbane-app/`:

```bash
npm start           # Dev server at http://localhost:4200
npm run build       # Production build
npm test            # Run tests (Vitest)
```

Run a single test file:
```bash
npx vitest run src/app/app.spec.ts
```

## Architecture

### Tech Stack
- **Angular 21** with standalone components, signals, and lazy-loaded routes
- **Tailwind CSS v4** for styling
- **localStorage** for persistence (no backend)
- **Vitest** for testing (not Karma/Jasmine)

### Directory Layout (`src/app/`)

```
app/
  data/          # Static game data (kin, professions, skills, magic)
  features/
    home/        # Character list screen (/)
    wizard/      # Multi-step creation wizard (/create/*)
      steps/     # One component per wizard step
    character-sheet/  # Character sheet view (/character/:id)
  models/        # TypeScript interfaces (character.models.ts)
  services/      # State and business logic
  shared/        # Reusable components and constants
```

### Services

- **`CharacterDraftService`** — wizard state, held in an Angular `signal`, persisted to `localStorage` as `dragonbane_draft`. Exposes typed setters (`setKin`, `setProfession`, `setAge`, `setAttributes`, etc.) that each enforce the cascade/reset rules defined in `DESIGN.md`.
- **`CharacterService`** — CRUD for saved characters in `localStorage` under `dragonbane_characters`.
- **`character-rules.service.ts`** — pure functions only (no DI): `deriveStats`, `computeSkills`, `applyAgeModifiers`, `roll4d6DropLowest`, `pointBuyCost`. Import directly; do not inject.

### State / Signal Pattern

Components read wizard state via `characterDraftService.draft()` (readonly signal). Mutations go through the service setters — never `patch()` directly from a component unless no typed setter fits. The signal updates and persists atomically in every setter.

### Cascade Rules

When a wizard step changes a foundational value, downstream data is reset. The reset logic lives exclusively in `CharacterDraftService` setters:

| Setter | What gets reset |
|--------|----------------|
| `setKin` | nothing (innate ability is derived from kin at display time) |
| `setProfession` | heroic abilities, profession skill picks, mage school/spells/tricks |
| `setAge` | attributes, all skills, `attributeGenerationMethod` |
| `setAttributes` | derived stats, all skill levels (trained flags preserved) |

### Point Buy

Budget is **54 points** (`POINT_BUY_BUDGET`), min **6**, max **18** (before age modifiers; an attribute raised +1 by age is capped at 17 so the final value never exceeds 18). The cost table is in `character-rules.service.ts`. Three generation modes exist: 4D6-drop-lowest roll, standard array (`STANDARD_ARRAY` = 17, 15, 14, 11, 10, 8), and point buy — see `attribute-assignment.md`. Note: `DESIGN.md` specifies 73 points / min 8 / max 15 — the implementation differs; trust the code.

### Game Data

Static reference data lives in `src/app/data/`:
- `kin.data.ts` — 6 kin entries with movement and innate ability
- `professions.data.ts` — 10 professions with skill lists and heroic ability names
- `skills.data.ts` — 30 skills with governing attribute
- `magic.data.ts` — spell lists for all three schools + general magic

### Visual Design

- Dark background, earthy mid-tones, gold/amber accents
- **Cinzel** font for headings, system sans-serif for body
- Clean cards and form controls; no parchment textures

---

## Design Context

### Users
Tabletop RPG players in two contexts: **solo pre-session prep** (laptop, unhurried) and **session zero at the table** (mix of phones/laptops, social pressure, quick decisions). Both matter equally.

### Brand Personality
**Stark, mythic, grounded.** Dragonbane is Scandinavian dark fantasy — bleak wilderness, harsh survival, ancient myth. The interface should feel like it belongs to the world: purposeful, a little severe, absolutely trustworthy. Players should feel ready for adventure, not like they filled out a form.

### Aesthetic Direction
- **Theme**: Dark always. The game is played at night under dim light.
- **Palette**: Stone/charcoal base with amber-gold accents (OKLCH). Accents are rare and meaningful — not decorative.
- **Typography**: Cinzel for headings. Body text: **Alegreya** or **Vollkorn** — warm, bookish, slightly heavy-set. NOT system-ui.
- **Texture**: Subtle grain/noise to prevent flat-dark looking like generic SaaS dark mode. NOT parchment, NOT leather. Think: iron, stone, ink on vellum.
- **Decoration**: Sparse but intentional — rune-like SVG dividers, geometric borders, typographic ornaments. No emoji, no generic icon libraries.

### Anti-References
- Heavy parchment / skeuomorphic textures
- D&D Beyond (too polished/corporate)
- Generic SaaS dark mode (flat gray + cyan accents, could be any app)

### Design Principles
1. **Atmosphere through restraint** — evocativeness from typography and color, not decoration.
2. **Table-ready legibility** — readable at arm's length on a dim screen. Generous tap targets, strong contrast.
3. **The app belongs to the world** — if it looks like a web app, it's wrong.
4. **Earn the accent** — gold/amber is precious. Active states, key actions, hierarchy only.
5. **Dark is a feature** — rich blacks, subtle depth, ink-and-shadow contrast.
