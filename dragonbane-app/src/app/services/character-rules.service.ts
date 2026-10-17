import { Attributes, AttributeKey, Age, Kin, DerivedStats, SkillEntry, MagicSchool, Character, GearItem } from '../models/character.models';
import { SKILLS_DATA } from '../data/skills.data';
import { KIN_DATA } from '../data/kin.data';
import { MAX_AT_HAND } from '../data/gear.data';

export function getBaseChance(score: number): number {
  if (score <= 5) return 3;
  if (score <= 8) return 4;
  if (score <= 12) return 5;
  if (score <= 15) return 6;
  return 7;
}

export function getMovementModifier(agl: number): number {
  if (agl <= 6) return -4;
  if (agl <= 9) return -2;
  if (agl <= 12) return 0;
  if (agl <= 15) return 2;
  return 4;
}

export function getDamageBonus(score: number): string {
  if (score <= 12) return '—';
  if (score <= 16) return '+D4';
  return '+D6';
}

export function applyAgeModifiers(attributes: Attributes, age: Age): Attributes {
  const a = { ...attributes };
  if (age === 'Young') {
    a.AGL = Math.min(18, a.AGL + 1);
    a.CON = Math.min(18, a.CON + 1);
  } else if (age === 'Old') {
    a.STR = Math.max(1, a.STR - 2);
    a.AGL = Math.max(1, a.AGL - 2);
    a.CON = Math.max(1, a.CON - 2);
    a.INT = Math.min(18, a.INT + 1);
    a.WIL = Math.min(18, a.WIL + 1);
  }
  return a;
}

export function deriveStats(attributes: Attributes, kin: Kin | undefined, age: Age | undefined): DerivedStats {
  const modified = age ? applyAgeModifiers(attributes, age) : attributes;
  const kinData = KIN_DATA.find(k => k.name === kin);
  const baseMove = kinData?.move ?? 10;
  const movement = baseMove + getMovementModifier(modified.AGL);

  return {
    hp: modified.CON,
    wp: modified.WIL,
    movement: Math.max(4, movement),
    strDamageBonus: getDamageBonus(modified.STR),
    aglDamageBonus: getDamageBonus(modified.AGL),
  };
}

// Untrained skill = base chance; trained at creation = 2× base chance
export function getSkillLevel(attrScore: number, trained: boolean): number {
  const baseChance = getBaseChance(attrScore);
  return trained ? baseChance * 2 : baseChance;
}

// Skill levels are derived from age-modified attributes. A mage's school is
// always a trained WIL skill.
export function computeSkills(
  attributes: Attributes,
  age: Age | undefined,
  trainedNames: Iterable<string> = [],
  magicSchool?: MagicSchool,
): Record<string, SkillEntry> {
  const modified = age ? applyAgeModifiers(attributes, age) : attributes;
  const trained = new Set(trainedNames);
  const result: Record<string, SkillEntry> = {};
  for (const skill of SKILLS_DATA) {
    const isTrained = trained.has(skill.name);
    result[skill.name] = {
      name: skill.name,
      level: getSkillLevel(modified[skill.attribute as AttributeKey], isTrained),
      trained: isTrained,
      advancementMarks: 0,
    };
  }
  if (magicSchool) {
    result[magicSchool] = {
      name: magicSchool,
      level: getSkillLevel(modified.WIL, true),
      trained: true,
      advancementMarks: 0,
    };
  }
  return result;
}

// Edit an attribute from the sheet, where scores are shown age-adjusted.
// The stored (raw) score absorbs the age offset; derived stats and untrained
// skill levels follow. Trained levels are advanced in play, so they're kept.
export function applyAttributeEdit(char: Character, attr: AttributeKey, finalValue: number): Character {
  if (!char.attributes) return char;
  // Nominal age offset, measured on a mid score so the 1..18 clamp can't hide it
  const mid: Attributes = { STR: 10, CON: 10, AGL: 10, INT: 10, WIL: 10, CHA: 10 };
  const offset = char.age ? applyAgeModifiers(mid, char.age)[attr] - 10 : 0;
  const raw = Math.max(1, Math.min(18, Math.round(finalValue) - offset));
  const attributes = { ...char.attributes, [attr]: raw };
  const derivedStats = deriveStats(attributes, char.kin, char.age);
  const modified = char.age ? applyAgeModifiers(attributes, char.age) : attributes;

  const skills: Record<string, SkillEntry> = {};
  for (const [name, entry] of Object.entries(char.skills)) {
    const skillAttr = SKILLS_DATA.find(s => s.name === name)?.attribute as AttributeKey | undefined;
    skills[name] = !entry.trained && skillAttr
      ? { ...entry, level: getSkillLevel(modified[skillAttr], false) }
      : entry;
  }

  return {
    ...char,
    attributes,
    derivedStats,
    skills,
    currentHP: Math.min(char.currentHP, derivedStats.hp),
    currentWP: Math.min(char.currentWP, derivedStats.wp),
  };
}

export function getTrainedSkillCount(age: Age): number {
  if (age === 'Young') return 8;
  if (age === 'Adult') return 10;
  return 12;
}

export interface DiceRoll {
  total: number;
  kept: number[];
  dropped: number;
}

export function roll4d6DropLowestDetailed(): DiceRoll {
  const all = Array.from({ length: 4 }, () => Math.floor(Math.random() * 6) + 1);
  all.sort((a, b) => a - b);
  const kept = all.slice(1);
  return { dropped: all[0], kept, total: kept.reduce((a, b) => a + b, 0) };
}

export function roll4d6DropLowest(): number {
  return roll4d6DropLowestDetailed().total;
}

// Point buy cost to reach a score from min (6)
// 6–12: 1 pt per point; 13–14: 2 pts per point; 15–18: 3 pts per point
const POINT_BUY_COSTS: Record<number, number> = {
  6: 0, 7: 1, 8: 2, 9: 3, 10: 4, 11: 5, 12: 6, 13: 8, 14: 10, 15: 13, 16: 16, 17: 19, 18: 22,
};

export function pointBuyCost(score: number): number {
  return POINT_BUY_COSTS[score] ?? 0;
}

export function pointBuyCostDelta(from: number, to: number): number {
  return (POINT_BUY_COSTS[to] ?? 0) - (POINT_BUY_COSTS[from] ?? 0);
}

export const POINT_BUY_BUDGET = 54;
export const STANDARD_ARRAY = [17, 15, 14, 11, 10, 8] as const;
export const POINT_BUY_MIN = 6;
export const POINT_BUY_MAX = 18;

export interface GearSlots {
  slots: number;
  free: boolean;
  /** Why the row (or one unit of it) costs nothing: "at hand", "worn", "backpack", "tiny" — or "rations" (pooled). */
  reason?: string;
}

export interface Encumbrance {
  capacity: number | null;
  load: number;
  over: boolean;
  full: boolean;
  hasBackpack: boolean;
  coinSlots: number;
  rationSlots: number;
  /** Weapon/shield rows flagged at hand, so the UI can lock a 4th checkbox. */
  atHandCount: number;
  items: Record<string, GearSlots>;
}

// Capacity is ⌈STR / 2⌉ (+2 for one backpack). Up to 3 weapons/shields at hand,
// one worn armor and one worn helmet are free — one unit each; extra quantity
// counts. Rations pool at 4 per slot; every full 100 coins takes a slot.
export function computeEncumbrance(gear: GearItem[], strAdjusted: number | null, coins: number): Encumbrance {
  const items: Record<string, GearSlots> = {};
  let atHand = 0;
  let armorWorn = false;
  let helmetWorn = false;
  let backpack = false;
  let rations = 0;
  let load = 0;

  for (const item of gear) {
    const weight = Math.max(0, item.weight);
    const qty = Math.max(0, item.quantity);
    if (item.type === 'ration') {
      rations += qty;
      items[item.id] = { slots: 0, free: false, reason: 'rations' };
      continue;
    }

    let reason: string | undefined;
    if (item.type === 'backpack' && !backpack) {
      backpack = true;
      reason = 'backpack';
    } else if (item.equipped && (item.type === 'weapon' || item.type === 'shield') && atHand < MAX_AT_HAND) {
      atHand++;
      reason = 'at hand';
    } else if (item.equipped && item.type === 'armor' && !armorWorn) {
      armorWorn = true;
      reason = 'worn';
    } else if (item.equipped && item.type === 'helmet' && !helmetWorn) {
      helmetWorn = true;
      reason = 'worn';
    }

    if (reason) {
      const slots = weight * Math.max(0, qty - 1);
      items[item.id] = { slots, free: true, reason };
      load += slots;
    } else if (weight === 0) {
      items[item.id] = { slots: 0, free: true, reason: 'tiny' };
    } else {
      items[item.id] = { slots: weight * qty, free: false };
      load += weight * qty;
    }
  }

  const rationSlots = Math.ceil(rations / 4);
  const coinSlots = Math.floor(Math.max(0, coins) / 100);
  load += rationSlots + coinSlots;

  const capacity = strAdjusted === null ? null : Math.ceil(strAdjusted / 2) + (backpack ? 2 : 0);
  return {
    capacity,
    load,
    over: capacity !== null && load > capacity,
    full: capacity !== null && load === capacity,
    hasBackpack: backpack,
    coinSlots,
    rationSlots,
    atHandCount: gear.filter(i => i.equipped && (i.type === 'weapon' || i.type === 'shield')).length,
    items,
  };
}
