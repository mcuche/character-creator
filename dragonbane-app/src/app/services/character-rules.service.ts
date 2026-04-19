import { Attributes, AttributeKey, Age, Kin, DerivedStats, SkillEntry } from '../models/character.models';
import { SKILLS_DATA } from '../data/skills.data';
import { KIN_DATA } from '../data/kin.data';

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

export function computeSkills(attributes: Attributes): Record<string, SkillEntry> {
  const result: Record<string, SkillEntry> = {};
  for (const skill of SKILLS_DATA) {
    const attrScore = attributes[skill.attribute as AttributeKey];
    const baseChance = getBaseChance(attrScore);
    const trainedLevel = baseChance * 2;
    result[skill.name] = {
      name: skill.name,
      level: trainedLevel,
      trained: false,
      advancementMarks: 0,
    };
  }
  return result;
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
