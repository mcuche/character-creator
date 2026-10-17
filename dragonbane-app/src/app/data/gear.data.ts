import { GearItem, GearType } from '../models/character.models';

export const GEAR_TYPE_LABELS: Record<GearType, string> = {
  item: 'Item',
  weapon: 'Weapon',
  shield: 'Shield',
  armor: 'Armor',
  helmet: 'Helmet',
  ration: 'Rations',
  backpack: 'Backpack',
};

export const GEAR_TYPES = Object.keys(GEAR_TYPE_LABELS) as GearType[];

/** Types that get an "at hand" / "worn" checkbox. */
export const EQUIPPABLE: GearType[] = ['weapon', 'shield', 'armor', 'helmet'];

/** Weapons and shields share the three "at hand" places. */
export const MAX_AT_HAND = 3;

export function isEquippable(type: GearType): boolean {
  return EQUIPPABLE.includes(type);
}

export function isAtHandType(type: GearType): boolean {
  return type === 'weapon' || type === 'shield';
}

/** A starting-kit entry. `'D6'` quantities are rolled when the wizard pre-fills the pack. */
export interface GearSeed {
  name: string;
  type: GearType;
  quantity?: number | 'D6';
  weight?: number;
}

// Checked in order: the first match wins
const TYPE_PATTERNS: [GearType, RegExp][] = [
  ['backpack', /back\s?pack/i],
  ['ration', /ration/i],
  ['helmet', /helm/i],
  ['shield', /shield/i],
  ['armor', /armou?r|chainmail|\bmail\b/i],
  ['weapon', /sword|axe|hammer|mace|dagger|knife|bow|spear|staff|sling|halberd|flail|club|trident|lance|morningstar|scimitar|pick\b/i],
];

export function inferGearType(name: string): GearType {
  return TYPE_PATTERNS.find(([, re]) => re.test(name))?.[0] ?? 'item';
}

/** Equip by list order: the first 3 weapon/shield rows, the first armor, the first helmet. */
export function autoEquip(items: GearItem[]): GearItem[] {
  let atHand = 0;
  let armor = false;
  let helmet = false;
  return items.map(item => {
    if (!isEquippable(item.type)) return item;
    let equipped = false;
    if (isAtHandType(item.type) && atHand < MAX_AT_HAND) {
      atHand++;
      equipped = true;
    } else if (item.type === 'armor' && !armor) {
      armor = equipped = true;
    } else if (item.type === 'helmet' && !helmet) {
      helmet = equipped = true;
    }
    return { ...item, equipped };
  });
}

/**
 * Fill in what older saves lack: an inferred type, weight 1, quantity ≥ 1 and an id.
 * Legacy lists (no item has an `equipped` key at all) are auto-equipped so existing
 * characters don't suddenly get heavier.
 */
export function normalizeGear(items: Partial<GearItem>[]): GearItem[] {
  const legacy = !items.some(i => 'equipped' in i);
  const gear = items.map((i): GearItem => {
    const name = i.name ?? '';
    const type = i.type ?? inferGearType(name);
    const quantity = Number.isFinite(i.quantity) ? Math.max(1, Math.floor(i.quantity!)) : 1;
    const weight = Number.isFinite(i.weight) ? Math.max(0, Math.floor(i.weight!)) : 1;
    return { ...i, id: i.id || crypto.randomUUID(), name, type, quantity, weight };
  });
  return legacy ? autoEquip(gear) : gear;
}

/**
 * Checkbox rules: one worn armor and one worn helmet (checking another swaps),
 * at most 3 weapons/shields at hand (a 4th check does nothing).
 */
export function setEquipped(items: GearItem[], id: string, on: boolean): GearItem[] {
  const target = items.find(i => i.id === id);
  if (!target || !isEquippable(target.type)) return items;
  if (!on) return items.map(i => i.id === id ? { ...i, equipped: false } : i);

  if (isAtHandType(target.type)) {
    if (target.equipped) return items;
    const atHand = items.filter(i => isAtHandType(i.type) && i.equipped).length;
    if (atHand >= MAX_AT_HAND) return items;
    return items.map(i => i.id === id ? { ...i, equipped: true } : i);
  }

  return items.map(i => {
    if (i.id === id) return { ...i, equipped: true };
    if (i.type === target.type && i.equipped) return { ...i, equipped: false };
    return i;
  });
}

/** Change an item's type: becoming equippable starts unchecked; anything else drops the flag. */
export function setGearType(items: GearItem[], id: string, type: GearType): GearItem[] {
  return items.map(i => {
    if (i.id !== id || i.type === type) return i;
    const { equipped: _, ...rest } = i;
    return isEquippable(type) ? { ...rest, type, equipped: false } : { ...rest, type };
  });
}
