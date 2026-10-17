import { findArmor, findWeapon, normalizeRefName, refOptions } from './gear-stats';
import { PROFESSION_DATA } from './professions.data';
import { GearItem, GearType } from '../models/character.models';

const item = (name: string, type: GearType, extra: Partial<GearItem> = {}): GearItem =>
  ({ id: name, name, type, quantity: 1, weight: 1, ...extra });

describe('normalizeRefName', () => {
  it('folds case, spacing, punctuation and British spelling', () => {
    expect(normalizeRefName('Leather Armour')).toBe('leatherarmor');
    expect(normalizeRefName('Shield (large)')).toBe('shieldlarge');
  });
});

describe('findWeapon / findArmor', () => {
  it('resolves every equippable suggested-gear seed', () => {
    for (const prof of PROFESSION_DATA) {
      for (const seed of prof.suggestedGear) {
        const gear = item(seed.name, seed.type);
        if (seed.type === 'weapon' || seed.type === 'shield') {
          expect(findWeapon(gear), `${prof.name}: ${seed.name}`).toBeDefined();
        } else if (seed.type === 'armor' || seed.type === 'helmet') {
          expect(findArmor(gear), `${prof.name}: ${seed.name}`).toBeDefined();
        }
      }
    }
  });

  it('resolves seeds that need an alias', () => {
    expect(findWeapon(item('Large Shield', 'shield'))?.name).toBe('Shield (large)');
    expect(findArmor(item('Leather Armor', 'armor'))?.name).toBe('Leather');
    expect(findArmor(item('Leather Armour', 'armor'))?.name).toBe('Leather');
  });

  it('only matches rows of the item type', () => {
    expect(findWeapon(item('Shield', 'weapon'))).toBeUndefined();
    expect(findWeapon(item('Shield', 'shield'))?.name).toBe('Shield (small)');
    expect(findArmor(item('Great Helm', 'armor'))).toBeUndefined();
    expect(findWeapon(item('Longsword', 'item'))).toBeUndefined();
  });

  it('prefers an explicit ref over the name', () => {
    expect(findWeapon(item('Longsword', 'weapon', { ref: 'Short Sword' }))?.name).toBe('Short Sword');
    expect(findWeapon(item('Rusty Thing', 'weapon', { ref: 'Short Sword' }))?.name).toBe('Short Sword');
  });

  it('never matches Unarmed', () => {
    expect(findWeapon(item('Unarmed', 'weapon'))).toBeUndefined();
    expect(findWeapon(item('Fists', 'weapon', { ref: 'Unarmed' }))).toBeUndefined();
    expect(refOptions('weapon')).not.toContain('Unarmed');
  });

  it('matches spacing variants and aliases', () => {
    expect(findWeapon(item('Hand Axe', 'weapon'))?.name).toBe('Handaxe');
    expect(findWeapon(item('Great Axe', 'weapon'))?.name).toBe('Two-Handed Axe');
    expect(findWeapon(item('Shortbow', 'weapon'))?.name).toBe('Short Bow');
    expect(findWeapon(item('Light Crossbow', 'weapon'))?.name).toBe('Crossbow (light)');
    expect(findArmor(item('Chain Mail', 'armor'))?.name).toBe('Chainmail');
    expect(findArmor(item('Helmet', 'helmet'))?.name).toBe('Open Helmet');
  });
});

describe('refOptions', () => {
  it('lists the rows for each equippable type', () => {
    expect(refOptions('shield')).toEqual(['Shield (small)', 'Shield (large)']);
    expect(refOptions('helmet')).toEqual(['Open Helmet', 'Great Helm']);
    expect(refOptions('armor')).toHaveLength(4);
    expect(refOptions('weapon')).toHaveLength(20);
    expect(refOptions('item')).toEqual([]);
  });
});
