# Attribute Assignment — Session Summary

## Point Buy System

### Cost Table (from min 6)
| Score | Total Cost | Cost per Point |
|-------|-----------|----------------|
| 6 | 0 | — |
| 7–12 | 1–6 | 1 pt/pt |
| 13–14 | 8–10 | 2 pts/pt |
| 15–18 | 13–22 | 3 pts/pt |

### Constants
- **Budget:** 54 pts
- **Min:** 6
- **Max:** 18 (before age modifiers)

### Age-Aware Max
Age modifiers that add +1 to an attribute lower its point buy ceiling to 17 (so the final value never exceeds 18):

| Age | Affected Attributes | Effective Max |
|-----|-------------------|---------------|
| Young | AGL, CON | 17 |
| Old | INT, WIL | 17 |
| All others | — | 18 |

Age modifiers are always applied on top of base values. Hard cap: no attribute can exceed 18 after age modifiers.

---

## Attribute Generation Methods

Three modes available in the wizard:

### 1. Roll (4D6 drop lowest)
- Roll 4D6, drop the lowest die, sum the remaining 3
- Produces 6 scores to freely assign to attributes
- Dropped die shown in red with strikethrough in the score pool
- Scores range 3–18; can exceed point buy ceiling

### 2. Standard Array
Fixed scores: **17, 15, 14, 11, 10, 8** — assign freely to the six attributes.

### 3. Point Buy
Spend budget (54 pts) to raise attributes from min 6 up to the effective max per attribute. Age-modified attributes capped at 17 (see above).

---

## Comparison: Point Buy vs. Rolling

| Method | Typical Total | Max Single Attr |
|--------|--------------|-----------------|
| 4D6 drop lowest (average) | ~51 | 18 |
| Point buy (60 pts, balanced) | ~75 | 18 |
| Standard array | 75 | 17 |

Point buy is more consistent than rolling; rolling can produce scores unreachable through point buy (18 is possible but costs 22 pts out of a 54 pt budget).

---

## Bug Fixed

Duplicate roll values (e.g. two scores of 12) previously caused both to disappear from the available pool when one was assigned. Fixed by consuming one match per assignment rather than using a Set filter.
