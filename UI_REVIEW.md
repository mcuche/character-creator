# UI Review: Dragonbane Character Creator

_Reviewed 2026-04-16_

---

## What's Working Well

- **Color system is cohesive.** Stone/amber palette is consistent throughout; `border-amber-800/40` on headers creates a clean separating line.
- **Cinzel font** for headings reads as fantasy without being tacky.
- **Wizard sidebar** with connector-line step list and checkmarks for completed steps is a strong UX pattern.
- **Sticky header with inline name edit** in the wizard doesn't interrupt the creation flow.
- **Delete confirm overlay** on character cards avoids a disruptive modal.

---

## Issues & Recommendations

### 1. Home screen — empty state feels weak
**Status:** Done (2026-10-17). The empty state shows the `ornaments/dragonbane-seal` SVG instead of the emoji.

**File:** `features/home/home.component.html`

The `🐉` emoji at 30% opacity is a generic placeholder. For an RPG tool the empty state should feel like an invitation.

**Recommendation:** Replace the emoji with an SVG sigil or Dragonbane-style decorative border element. Push the CTA button to `amber-500` with more vertical breathing room.

---

### 2. Character cards lack visual personality
**Status:** Done (2026-10-17). Roster entries were reworked in `06c9884`: HP/WP on each entry and a profession glyph.

**File:** `features/home/home.component.html`

Cards show name/kin/profession/age as flat `stone-700` pills with no visual accent. HP/WP only render `@if (char.attributes)`, so partially-created characters look especially bare.

**Recommendation:**
- Add a subtle left border accent (`border-l-2 border-amber-600`) to each card — gives it a "spine" feel.
- Always render HP/WP as `—/—` when not yet set, so the layout is consistent.

---

### 3. Wizard header name input has no affordance
**Status:** Done (2026-10-17). `.hero-name-input` has a bottom border that turns amber on focus.

**File:** `features/wizard/wizard.component.html`

The character name `<input>` sits on a `stone-950/95` bar with no border or visual cue. It looks like static text until clicked — a discoverability problem.

**Recommendation:** Add `border-b border-stone-700 focus:border-amber-500 transition-colors` to the input. Two lines of CSS, significant clarity gain.

---

### 4. Emoji dice icon is inconsistent with design tone
**Status:** Done (2026-10-17). No emoji remain in the app templates; the roll buttons read "Roll D12".

**Files:** `features/wizard/steps/kin/`, `profession/`, `age/`, etc.

`🎲 Roll D12` mixes system emoji (which render differently per platform) with an otherwise clean, Cinzel-driven design system.

**Recommendation:** Replace with a small inline SVG die icon (16px cube outline) or a unicode character styled with `text-amber-400`. Keeps the roll action recognizable without emoji fragility.

---

### 5. Character sheet tab bar indicator is too subtle
**Status:** Done (2026-10-17). `.sheet-tab.active` has a 3px amber underline plus a faint amber fill.

**File:** `features/character-sheet/character-sheet.component.html`

The active tab uses a 2px `border-b` in `amber-500`. On a dark background (`stone-900`) this nearly disappears, making it hard to tell which tab is active at a glance.

**Recommendation:**
- Increase indicator to 3px: `border-b-[3px]`
- Add `bg-amber-600/10` background fill on the active tab for secondary visual confirmation.

---

### 6. Body font defaults to `system-ui` — missed opportunity
**Status:** Done (2026-10-17). The body font is Vollkorn, which `CLAUDE.md` prefers over Crimson Pro.

**File:** `src/styles.css`

`system-ui` (Segoe UI on Windows, SF Pro on Mac) contrasts with Cinzel but lacks personality. A purpose-chosen serif would give body text a fantasy-adjacent warmth.

**Recommendation:** Add **Crimson Pro** alongside Cinzel:
```css
@import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,400;0,600;1,400&display=swap');
```
Then set `font-family: 'Crimson Pro', serif` as the base body in `@theme` or `body {}`.

---

### 7. HP/WP +/− buttons too small for table use
**Status:** Done (2026-10-17). The sheet uses 44px circular `.vital-stepper` buttons for HP, WP and coin.

**File:** `features/character-sheet/character-sheet.component.html` (lines 31–46)

`h-6 w-6` increment/decrement buttons are barely tappable on a phone or tablet — a real problem if this is used at the game table.

**Recommendation:** Bump to `h-8 w-8 rounded-md text-lg`, or redesign as a tap-to-increment on the value itself.

---

## Priority Summary

| Priority | Issue | Estimated Effort |
|----------|-------|-----------------|
| High | ~~Name input affordance in wizard header~~ (done) | ~5 min |
| High | ~~Card left-border accent + consistent HP/WP display~~ (done) | ~10 min |
| Medium | ~~Tab active state visibility~~ (done) | ~5 min |
| Medium | ~~Replace emoji dice with SVG icon~~ (done) | ~15 min |
| Low | ~~Crimson Pro body font~~ (done) | ~10 min |
| Low | ~~HP/WP button size on character sheet~~ (done) | ~5 min |
