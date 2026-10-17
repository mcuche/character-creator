import { GearItem, GearType } from '../models/character.models';
import { WEAPON_DATA } from './weapons.data';
import { ARMOR_DATA } from './armor.data';
import { isEquippable } from './gear.data';
import { normalizeRefName } from './gear-stats';

/** One pickable entry in the add-gear combobox. */
export interface CatalogItem {
  name: string;
  type: GearType;
  weight: number;
  group: string;
  /** Short stat line shown beside the name. */
  detail?: string;
}

const GENERAL: [string, GearType][] = [
  ['Backpack', 'backpack'],
  ['Rations', 'ration'],
  ['Torch', 'item'],
  ['Lantern', 'item'],
  ['Oil Lamp', 'item'],
  ['Lamp Oil', 'item'],
  ['Tallow Candle', 'item'],
  ['Tinderbox', 'item'],
  ['Rope (10m)', 'item'],
  ['Grappling Hook', 'item'],
  ['Crowbar', 'item'],
  ['Shovel', 'item'],
  ['Lockpicks', 'item'],
  ['Sleeping Fur', 'item'],
  ['Small Tent', 'item'],
  ['Large Tent', 'item'],
  ['Field Kitchen', 'item'],
  ['Waterskin', 'item'],
  ['Sack', 'item'],
  ['Bandages', 'item'],
  ['Spyglass', 'item'],
  ['Map', 'item'],
  ['Fishing Rod', 'item'],
  ['Fishing Net', 'item'],
  ['Quiver (20 arrows)', 'item'],
  ['Crafting Tools', 'item'],
  ['Nautical Tools', 'item'],
  ['Merchant\'s Scales', 'item'],
  ['Instrument', 'item'],
  ['Ink & Quill', 'item'],
  ['Grimoire', 'item'],
  ['Coin Purse', 'item'],
  ['Travelling Clothes', 'item'],
  ['Travelling Robes', 'item'],
  ['Fine Clothes', 'item'],
  ['Dark Clothes', 'item'],
  ['Winter Clothes', 'item'],
  ['Cloak', 'item'],
];

const weaponDetail = (w: (typeof WEAPON_DATA)[number]): string =>
  [w.damage, w.grip, w.str ? `STR ${w.str}` : null].filter(Boolean).join(' · ');

/** Weapons and armor from the reference tables, then general gear. Weights are editable per row. */
export const GEAR_CATALOG: CatalogItem[] = [
  ...WEAPON_DATA.filter(w => !w.shield && !w.ranged && w.name !== 'Unarmed')
    .map(w => ({ name: w.name, type: 'weapon' as const, weight: 1, group: 'Melee weapons', detail: weaponDetail(w) })),
  ...WEAPON_DATA.filter(w => w.ranged)
    .map(w => ({
      name: w.name, type: 'weapon' as const, group: 'Ranged weapons', detail: weaponDetail(w),
      weight: w.features.includes('tiny') ? 0 : 1,
    })),
  ...WEAPON_DATA.filter(w => w.shield)
    .map(w => ({ name: w.name, type: 'shield' as const, weight: 1, group: 'Shields', detail: `STR ${w.str}` })),
  ...ARMOR_DATA.map(a => ({
    // "Leather" alone reads oddly in a pack; the alias table still matches the stats
    name: a.name.startsWith('Leather') || a.name.startsWith('Studded') ? `${a.name} Armor` : a.name,
    type: a.kind, weight: 1,
    group: a.kind === 'armor' ? 'Armor' : 'Helmets',
    detail: a.kind === 'armor' ? `Armor ${a.rating}` : `+${a.rating} armor`,
  })),
  ...GENERAL.map(([name, type]) => ({ name, type, weight: 1, group: 'Gear & provisions' })),
];

/** Catalog entries whose name contains the query; the whole catalog for an empty query. */
export function searchCatalog(query: string): CatalogItem[] {
  const q = normalizeRefName(query);
  if (!q) return GEAR_CATALOG;
  return GEAR_CATALOG.filter(c => normalizeRefName(c.name).includes(q));
}

/** The entry a typed name means exactly, ignoring case, spacing and "armour". */
export function findCatalogItem(name: string): CatalogItem | undefined {
  const key = normalizeRefName(name);
  return key ? GEAR_CATALOG.find(c => normalizeRefName(c.name) === key) : undefined;
}

/**
 * Add one of an entry to the list. Stackable things (not weapons or armor) already
 * in the list get +1 quantity instead of a second row.
 */
export function addGear(gear: GearItem[], entry: Pick<CatalogItem, 'name' | 'type' | 'weight'>): GearItem[] {
  const key = normalizeRefName(entry.name);
  const existing = isEquippable(entry.type)
    ? undefined
    : gear.find(i => i.type === entry.type && normalizeRefName(i.name) === key);
  if (existing) {
    return gear.map(i => i === existing ? { ...i, quantity: i.quantity + 1 } : i);
  }
  const added: GearItem = { id: crypto.randomUUID(), name: entry.name, type: entry.type, quantity: 1, weight: entry.weight };
  if (isEquippable(entry.type)) added.equipped = false;
  return [...gear, added];
}
