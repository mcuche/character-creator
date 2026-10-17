import { GearItem, GearType } from '../models/character.models';
import { WEAPON_ALIASES, WEAPON_DATA, WeaponData } from './weapons.data';
import { ARMOR_ALIASES, ARMOR_DATA, ArmorData } from './armor.data';

/** "Leather Armour" → "leatherarmor": lower-case, British spelling folded, a-z0-9 only. */
export function normalizeRefName(s: string): string {
  return s.toLowerCase().replace(/armour/g, 'armor').replace(/[^a-z0-9]/g, '');
}

// Rows a gear type may resolve to. Unarmed is never a gear row.
function weaponRows(type: GearType): WeaponData[] {
  if (type === 'shield') return WEAPON_DATA.filter(w => w.shield);
  if (type === 'weapon') return WEAPON_DATA.filter(w => !w.shield && w.name !== 'Unarmed');
  return [];
}

function armorRows(type: GearType): ArmorData[] {
  if (type === 'armor' || type === 'helmet') return ARMOR_DATA.filter(a => a.kind === type);
  return [];
}

/** Explicit ref first, then the normalized name, then the alias table. */
function resolve<T extends { name: string }>(item: GearItem, rows: T[], aliases: Record<string, string>): T | undefined {
  if (rows.length === 0) return undefined;
  if (item.ref) {
    const byRef = rows.find(r => r.name === item.ref);
    if (byRef) return byRef;
  }
  const key = normalizeRefName(item.name);
  const alias = aliases[key];
  return rows.find(r => normalizeRefName(r.name) === key) ?? (alias ? rows.find(r => r.name === alias) : undefined);
}

export function findWeapon(item: GearItem): WeaponData | undefined {
  return resolve(item, weaponRows(item.type), WEAPON_ALIASES);
}

export function findArmor(item: GearItem): ArmorData | undefined {
  return resolve(item, armorRows(item.type), ARMOR_ALIASES);
}

/** Reference names the gear editor's "Stats" select offers for a type. */
export function refOptions(type: GearType): string[] {
  return [...weaponRows(type), ...armorRows(type)].map(r => r.name);
}
