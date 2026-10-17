export type Grip = '1H' | '2H' | '—';

export interface WeaponData {
  name: string;
  grip: Grip;
  /** STR requirement; null where the table has "—". */
  str: number | null;
  damage: string;
  /** Null for ranged weapons and Unarmed. */
  durability: number | null;
  /** Range in meters (ranged weapons only). */
  range?: number;
  /** Governing weapon skill, or the best STR melee skill for shields. */
  skill: string | 'best-str-melee';
  features: string[];
  shield?: boolean;
  ranged?: boolean;
}

/** Melee and ranged weapons from rules.md § Gear Reference, in table order. */
export const WEAPON_DATA: WeaponData[] = [
  { name: 'Knife', grip: '1H', str: null, damage: 'D8', durability: 6, skill: 'Knives', features: ['subtle', 'piercing', 'thrown'] },
  { name: 'Dagger', grip: '1H', str: null, damage: 'D8', durability: 9, skill: 'Knives', features: ['subtle', 'piercing', 'slashing', 'thrown'] },
  { name: 'Short Sword', grip: '1H', str: 7, damage: 'D10', durability: 12, skill: 'Swords', features: ['piercing', 'slashing'] },
  { name: 'Broadsword', grip: '1H', str: 10, damage: '2D6', durability: 15, skill: 'Swords', features: ['piercing', 'slashing'] },
  { name: 'Longsword', grip: '1H', str: 13, damage: '2D8', durability: 15, skill: 'Swords', features: ['piercing', 'slashing'] },
  { name: 'Greatsword', grip: '2H', str: 16, damage: '2D10', durability: 15, skill: 'Swords', features: ['piercing', 'slashing'] },
  { name: 'Handaxe', grip: '1H', str: 7, damage: '2D6', durability: 9, skill: 'Axes', features: ['toppling', 'slashing', 'thrown'] },
  { name: 'Battleaxe', grip: '1H', str: 13, damage: '2D8', durability: 9, skill: 'Axes', features: ['toppling', 'slashing'] },
  { name: 'Two-Handed Axe', grip: '2H', str: 16, damage: '2D10', durability: 9, skill: 'Axes', features: ['toppling', 'slashing'] },
  { name: 'Mace', grip: '1H', str: 7, damage: '2D4', durability: 12, skill: 'Hammers', features: ['bludgeoning'] },
  { name: 'Morningstar', grip: '1H', str: 13, damage: '2D8', durability: 12, skill: 'Hammers', features: ['bludgeoning'] },
  { name: 'Warhammer', grip: '1H', str: 10, damage: '2D6', durability: 12, skill: 'Hammers', features: ['bludgeoning', 'toppling'] },
  { name: 'Staff', grip: '2H', str: 7, damage: 'D8', durability: 9, skill: 'Staves', features: ['bludgeoning', 'toppling'] },
  { name: 'Long Spear', grip: '2H', str: 10, damage: '2D8', durability: 9, skill: 'Spears', features: ['long', 'piercing'] },
  // rules.md doesn't name the Halberd's skill; Spears is the closest fit
  { name: 'Halberd', grip: '2H', str: 13, damage: '2D8', durability: 12, skill: 'Spears', features: ['long', 'toppling', 'piercing', 'slashing'] },
  { name: 'Shield (small)', grip: '1H', str: 7, damage: 'D8', durability: 15, skill: 'best-str-melee', features: ['bludgeoning'], shield: true },
  { name: 'Shield (large)', grip: '1H', str: 13, damage: 'D8', durability: 18, skill: 'best-str-melee', features: ['bludgeoning'], shield: true },
  { name: 'Unarmed', grip: '—', str: null, damage: 'D6', durability: null, skill: 'Brawling', features: ['bludgeoning'] },
  { name: 'Sling', grip: '1H', str: null, damage: 'D8', durability: null, range: 20, skill: 'Slings', features: ['bludgeoning', 'tiny'], ranged: true },
  { name: 'Short Bow', grip: '2H', str: 7, damage: 'D10', durability: null, range: 30, skill: 'Bows', features: ['piercing'], ranged: true },
  { name: 'Longbow', grip: '2H', str: 13, damage: 'D12', durability: null, range: 100, skill: 'Bows', features: ['piercing'], ranged: true },
  { name: 'Crossbow (light)', grip: '2H', str: 7, damage: '2D6', durability: null, range: 40, skill: 'Crossbows', features: ['piercing', 'no damage bonus'], ranged: true },
  { name: 'Crossbow (heavy)', grip: '2H', str: 13, damage: '2D8', durability: null, range: 60, skill: 'Crossbows', features: ['piercing', 'no damage bonus'], ranged: true },
];

/**
 * Normalized alias → reference name (see `normalizeRefName`). Spacing variants
 * such as "Hand Axe", "Shortbow" and "Long Bow" already match through normalization.
 */
export const WEAPON_ALIASES: Record<string, string> = {
  largeshield: 'Shield (large)',
  smallshield: 'Shield (small)',
  shield: 'Shield (small)',
  spear: 'Long Spear',
  lightcrossbow: 'Crossbow (light)',
  heavycrossbow: 'Crossbow (heavy)',
  greataxe: 'Two-Handed Axe',
  quarterstaff: 'Staff',
};
