# Dragonbane Character Creator — Design Document

## Overview

A web application for creating and managing characters for the Dragonbane RPG (Free League Publishing, DB_Rules_v2.pdf, 2nd printing). The initial scope covers character creation and the character sheet view. Future features (combat tracker, spell manager) are explicitly out of scope.

---

## Tech Stack

| Concern | Choice |
|---------|--------|
| Framework | Angular + TypeScript |
| Styling | Tailwind CSS |
| Persistence | localStorage |
| Backup/export | JSON export/import |
| PDF export | Out of scope |

---

## Visual Design

- **Palette:** Dark background, earthy mid-tones, gold/amber accents
- **Typography:** [Cinzel](https://fonts.google.com/specimen/Cinzel) for headings (fantasy display font), system sans-serif for body text
- **Aesthetic:** Modern layout and readable typography with fantasy accents — no parchment textures or heavy ornamentation
- **Component style:** Clean cards, clear form controls, subtle themed borders/dividers

---

## Routing Structure

```
/                          → Home (character list)
/create                    → Redirects to /create/kin
/create/kin                → Step 1: Kin
/create/profession         → Step 2: Profession
/create/mage-school        → Step 2b: Magic school + spells (Mage only)
/create/age                → Step 3: Age
/create/attributes         → Step 4: Attributes
/create/derived            → Step 5: Derived stats
/create/skills             → Step 6: Trained skills
/create/weakness           → Step 7: Weakness (optional)
/create/gear               → Step 8: Gear
/create/memento            → Step 9: Memento (optional)
/create/appearance         → Step 10: Appearance
/create/summary            → Step 11: Summary
/character/:id             → Character sheet
```

The browser back button works naturally — each wizard step is a real route. A wizard guard prevents navigating to a later step before completing earlier ones.

---

## Home Screen (`/`)

- Lists all saved characters as cards
- Each card shows: **name, kin, profession, age**
- Actions per card: **Open** (go to sheet) · **Delete** (with confirmation)
- **"Create New Character"** button navigates to `/create/kin`
- Empty state: friendly prompt to create a first character

---

## Character Creation Wizard

### Persistent Elements
- **Character name** field always visible in the wizard header, editable at any time
- **Step progress indicator** showing current position in the wizard
- **Back button** on every step (navigates to previous step with surgical reset warnings where needed)

### Cascade / Reset Rules

When a player navigates back and changes a step, only dependent data is reset:

| Changed Step | Data Reset |
|---|---|
| Kin | Movement, innate ability |
| Profession | Heroic ability, 6 profession skill selections (free picks preserved) |
| Mage School | School skill, all starting spell selections |
| Age | Attribute modifiers (invalidates point buy total or rolled values), skill slot count |
| Attributes | All derived stats, all trained skill levels |

A warning toast/modal is shown before any reset: e.g. _"Changing your profession will reset your 6 profession skill selections. Your free skill picks will be preserved."_

---

### Step 1 — Kin (`/create/kin`)

**Choose vs. Roll (D12)**

Displays all 6 kin options in a selectable card grid. Each card shows:
- Kin name
- Movement score
- Innate ability name + description + WP cost

Rolling randomly highlights the result on the grid; the player can accept or re-roll. Player can also click any card directly to choose.

| D12 | Kin | Move | Innate Ability |
|-----|-----|------|----------------|
| 1–4 | Human | 10 | Adaptive |
| 5–7 | Halfling | 8 | Hard to Catch |
| 8–9 | Dwarf | 8 | Unforgiving |
| 10 | Elf | 10 | Inner Peace |
| 11 | Mallard | 8 | Ill-Tempered + Webbed Feet |
| 12 | Wolfkin | 12 | Hunting Instincts |

---

### Step 2 — Profession (`/create/profession`)

**Choose vs. Roll (D10)**

Same card-grid pattern as Kin. Each card shows:
- Profession name
- Key attribute
- Heroic ability name + description (or "Magic" for Mage)

If **Mage** is selected, the next step is `/create/mage-school` before continuing to Age.

| D10 | Profession | Key Attr. | Heroic Ability |
|-----|-----------|-----------|----------------|
| 1 | Artisan | STR | Master Craftsman |
| 2 | Bard | CHA | Musician |
| 3 | Fighter | STR | Veteran |
| 4 | Hunter | AGL | Companion |
| 5 | Knight | STR | Guardian |
| 6 | Mage | WIL | Magic (see step 2b) |
| 7 | Mariner | AGL | Sea Legs |
| 8 | Merchant | CHA | Treasure Hunter |
| 9 | Scholar | INT | Intuition |
| 10 | Thief | AGL | Backstabbing |

---

### Step 2b — Mage School (`/create/mage-school`) *(Mage only)*

Three choices: **Animism**, **Elementalism**, **Mentalism**

Each displayed as a card with:
- School name
- Description of theme
- List of available tricks and rank 1 spells

Player selects:
1. One school (becomes a trained skill)
2. **3 rank 1 spells** from their school or General Magic
3. **3 magic tricks** from their school or General Magic

Available rank 1 spells and tricks are sourced directly from the spell list in the rules.

---

### Step 3 — Age (`/create/age`)

**Choose vs. Roll (D6)**

Three options displayed as cards:

| D6 | Age | Trained Skills | Attribute Modifier |
|----|-----|----------------|--------------------|
| 1–3 | Young | 8 | AGL +1, CON +1 |
| 4–5 | Adult | 10 | — |
| 6 | Old | 12 | STR −2, AGL −2, CON −2, INT +1, WIL +1 |

Age modifiers are applied automatically during the Attributes step.

---

### Step 4 — Attributes (`/create/attributes`)

**Roll vs. Point Buy toggle**

#### Roll Mode
- "Roll All" button: generates 6 scores using 4D6 drop lowest
- Each score displayed in an assignable slot; player drags or assigns scores to STR, CON, AGL, INT, WIL, CHA
- "Re-roll All" available before assigning
- "Swap Two" button: player selects any two assigned attributes to swap (as per rules)
- Age modifiers shown inline as adjustments: e.g. `CON: 12 + 1 (Young) = 13`

#### Point Buy Mode
- **Budget: 73 points**
- **Min: 8, Max: 15** (before age modifiers)
- **Ascending cost table:**

| Attribute Score | Cost per Point |
|----------------|---------------|
| 8 | 1 |
| 9–12 | 1 |
| 13–14 | 2 |
| 15 | 3 |

*(Total cost to reach each score: 8=0, 9=1, 10=2, 11=3, 12=4, 13=6, 14=8, 15=11)*

- Remaining points shown prominently; can't exceed budget
- Age modifiers applied on top of point buy values (can push above 15, up to 18 max)

---

### Step 5 — Derived Stats (`/create/derived`)

Read-only. All values auto-calculated and shown with their formula:

| Derived Stat | Formula |
|---|---|
| HP | = CON value |
| WP | = WIL value |
| Movement | = Kin base ± AGL movement modifier |
| STR Damage Bonus | Based on STR score (≤12: none / 13–16: +D4 / 17+: +D6) |
| AGL Damage Bonus | Based on AGL score (same table) |
| Skill Base Chances | Per attribute: score 1–5→3, 6–8→4, 9–12→5, 13–15→6, 16–18→7 |
| Trained Skill Level | = 2× base chance of governing attribute |

Player reviews and confirms before continuing.

---

### Step 6 — Trained Skills (`/create/skills`)

Total slots determined by age: **8 (Young) / 10 (Adult) / 12 (Old)**

**Layout: two sections**

1. **Profession Skills** — the profession's skill list, shown first. Player must select exactly **6**. Each skill shown with its governing attribute and trained level (e.g. `Swords — STR — 12`). For Mages, the chosen magic school counts as one of these 6.
2. **Free Picks** — all 30 skills available; remaining slots (age total minus 6) can be filled freely. Skills already selected as profession picks are greyed out.

Selection counter shown: e.g. `Profession: 4/6 · Free: 2/4`

---

### Step 7 — Weakness (`/create/weakness`)

Optional — hidden behind an **"Add a Weakness"** toggle button.

When expanded:
- **Suggested list** of 12 example weaknesses as cards, each with a one-line hint (e.g. Greedy: "Can't walk past unguarded treasure."). Data in `data/weaknesses.data.ts`
- Clicking a card populates the text field with its name (still editable); only the name is stored
- **Roll D12** button in the step header picks a card at random (and expands the section if collapsed)
- **Free text field** for custom weakness
- **Remove** button to collapse and clear

---

### Step 8 — Gear (`/create/gear`)

Profession-based suggested loadout pre-populated, freely editable.

**Suggested loadouts (to be defined):**

| Profession | Suggested Gear |
|---|---|
| Artisan | Hammer, leather armor, crafting tools |
| Bard | Dagger, instrument, travelling clothes |
| Fighter | Broadsword, chainmail, open helmet |
| Hunter | Longbow, leather armor, hunting knife |
| Knight | Longsword, large shield, plate armor, great helm |
| Mage | Staff, grimoire, robes |
| Mariner | Short sword, rope, nautical tools |
| Merchant | Dagger, merchant's scales, coin purse |
| Scholar | Staff, grimoire, lantern |
| Thief | Knife, lockpicks, dark clothes |

Player can add items from the full gear reference list, remove suggested items, or enter custom items as free text.

Each item has a type (item, weapon, shield, armor, helmet, rations, backpack) and a weight. The starting kit is pre-filled worn and at hand; "D6 rations" is rolled once on pre-fill. The same gear list (with encumbrance counter) is used on the character sheet.

---

### Step 9 — Memento (`/create/memento`)

Optional — hidden behind an **"Add a Memento"** toggle button.

When expanded:
- **Example mementos** — 12 cards (name + significance). Clicking one fills both fields, which stay editable. Data in `data/mementos.data.ts`
- **Roll D12** button in the step header picks a card at random (and expands the section if collapsed)
- **Name** field (e.g. "My father's ring")
- **Significance** field (e.g. "A reminder of home; I carry it to stay grounded")
- **Remove** button to collapse and clear

---

### Step 10 — Appearance (`/create/appearance`)

Structured fields (all optional):

- Height
- Build
- Hair
- Eyes
- Skin
- Distinguishing features (text area)

---

### Step 11 — Summary (`/create/summary`)

Full character sheet preview — identical in layout to the character sheet view.

Each section has an **"Edit"** link that navigates back to the relevant wizard step (with reset warnings if applicable).

**Actions:**
- **Save & Open Sheet** — saves character to localStorage, navigates to `/character/:id`
- **Export JSON** — downloads character data as a `.json` file

---

## Character Sheet (`/character/:id`)

### Persistent Header
- Character name (inline editable)
- Kin · Profession · Age (inline editable)
- Current HP / Max HP (inline editable)
- Current WP / Max WP (inline editable)

### Tabs

#### 1. Core Stats
- Attributes (STR, CON, AGL, INT, WIL, CHA) — inline editable
- Derived stats (movement, damage bonuses) — auto-recalculated from attributes, shown with formula
- Conditions — 6 checkboxes (Exhausted, Sickly, Dazed, Angry, Scared, Disheartened)

#### 2. Skills
- All 30 skills listed with governing attribute and current level
- Trained skills highlighted
- **Advancement marks** — up to 2 tick boxes per skill (for Dragon/Demon marks)
- Inline editable skill levels

#### 3. Abilities & Magic
- Heroic abilities list (name, WP cost, effect)
- Innate ability (from Kin)
- Mage only: magic school skill level, prepared spells list, magic tricks list

#### 4. Gear
- Weapons table (name, grip, STR req, damage, durability, features)
- Armor (type, rating, current durability)
- Inventory list with encumbrance tracking (slots used / ⌈STR÷2⌉, +2 for one backpack). Weapon and shield rows have an **At hand** checkbox (max 3 at hand, free); armor and helmet rows have a **Worn** checkbox (one of each, free — checking another swaps). Rations take 1 slot per 4; every full 100 coins takes 1 slot
- Gold/silver/copper tracker

---

## Data Model

```typescript
interface Character {
  id: string;                        // uuid
  name: string;
  kin: Kin;
  profession: Profession;
  age: Age;
  attributes: Attributes;
  derivedStats: DerivedStats;
  trainedSkills: string[];           // skill names
  skills: Record<string, number>;    // skill name → level
  advancementMarks: Record<string, number>; // skill name → marks (0–2)
  heroicAbilities: string[];
  innateAbility: string;
  weakness?: string;
  gear: GearItem[];
  memento?: Memento;
  appearance: Appearance;
  currentHP: number;
  currentWP: number;
  conditions: Condition[];
  // Mage only
  magicSchool?: MagicSchool;
  preparedSpells?: string[];
  magicTricks?: string[];
  createdAt: string;                 // ISO date
  updatedAt: string;                 // ISO date
}

type Kin = 'Human' | 'Halfling' | 'Dwarf' | 'Elf' | 'Mallard' | 'Wolfkin';
type Profession = 'Artisan' | 'Bard' | 'Fighter' | 'Hunter' | 'Knight' | 'Mage' | 'Mariner' | 'Merchant' | 'Scholar' | 'Thief';
type Age = 'Young' | 'Adult' | 'Old';
type MagicSchool = 'Animism' | 'Elementalism' | 'Mentalism';
type Condition = 'Exhausted' | 'Sickly' | 'Dazed' | 'Angry' | 'Scared' | 'Disheartened';

interface Attributes {
  STR: number; CON: number; AGL: number;
  INT: number; WIL: number; CHA: number;
}

interface DerivedStats {
  hp: number; wp: number; movement: number;
  strDamageBonus: string; aglDamageBonus: string;
  skillBaseChances: Record<string, number>;
}

type GearType = 'item' | 'weapon' | 'shield' | 'armor' | 'helmet' | 'ration' | 'backpack';

interface GearItem {
  id: string;
  name: string;
  type: GearType;
  quantity: number;
  weight: number;       // 0 = tiny, 1 = normal, 2+ = heavy
  equipped?: boolean;   // "at hand" (weapon/shield) or "worn" (armor/helmet)
  notes?: string;
}

interface Memento {
  name: string;
  significance: string;
}

interface Appearance {
  height?: string;
  build?: string;
  hair?: string;
  eyes?: string;
  skin?: string;
  distinguishingFeatures?: string;
}
```

---

## State Management

- **Wizard state:** An Angular service (`CharacterDraftService`) holds the in-progress character across wizard steps. Persisted to `localStorage` as `dragonbane_draft` so refreshing the page doesn't lose progress.
- **Saved characters:** `CharacterService` manages CRUD operations against `localStorage` key `dragonbane_characters` (array of `Character`).
- **Active character:** The sheet view loads by ID from the character list.

---

## Out of Scope (Future Features)

- PDF export
- User accounts / cloud sync
- Combat tracker (initiative cards, HP tracking for all combatants)
- Spell manager (WP spending, concentration tracking)
- Dice roller
- Campaign management / multiple party support
