import { GEAR_CATALOG, addGear, findCatalogItem, searchCatalog } from './gear-catalog.data';
import { findArmor, findWeapon } from './gear-stats';
import { inferGearType } from './gear.data';
import { GearItem } from '../models/character.models';

const row = (name: string, extra: Partial<GearItem> = {}): GearItem =>
  ({ id: name, name, type: inferGearType(name), quantity: 1, weight: 1, ...extra });

describe('GEAR_CATALOG', () => {
  it('has unique names', () => {
    const names = GEAR_CATALOG.map(c => c.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it('resolves every weapon, shield and armor entry to its stats by name', () => {
    for (const c of GEAR_CATALOG) {
      const item = row(c.name, { type: c.type });
      if (c.type === 'weapon' || c.type === 'shield') expect(findWeapon(item), c.name).toBeDefined();
      if (c.type === 'armor' || c.type === 'helmet') expect(findArmor(item), c.name).toBeDefined();
    }
  });

  it('leaves out Unarmed and marks the sling tiny', () => {
    expect(findCatalogItem('Unarmed')).toBeUndefined();
    expect(findCatalogItem('Sling')?.weight).toBe(0);
  });
});

describe('searchCatalog', () => {
  it('returns everything for an empty query', () => {
    expect(searchCatalog('  ')).toBe(GEAR_CATALOG);
  });

  it('matches substrings, ignoring case and spacing', () => {
    expect(searchCatalog('SWORD').map(c => c.name)).toEqual(['Short Sword', 'Broadsword', 'Longsword', 'Greatsword']);
    expect(searchCatalog('fishing r').map(c => c.name)).toEqual(['Fishing Rod']);
  });
});

describe('findCatalogItem', () => {
  it('matches whole names only', () => {
    expect(findCatalogItem('torch')?.name).toBe('Torch');
    expect(findCatalogItem('leather armour')?.type).toBe('armor');
    expect(findCatalogItem('tor')).toBeUndefined();
  });
});

describe('addGear', () => {
  it('stacks a stackable item already in the list', () => {
    const gear = addGear([row('Torch', { quantity: 2 })], { name: 'torch', type: 'item', weight: 1 });
    expect(gear).toHaveLength(1);
    expect(gear[0].quantity).toBe(3);
  });

  it('adds weapons and armor as new, unequipped rows', () => {
    const gear = addGear([row('Dagger', { equipped: true })], { name: 'Dagger', type: 'weapon', weight: 1 });
    expect(gear).toHaveLength(2);
    expect(gear[1]).toMatchObject({ name: 'Dagger', type: 'weapon', quantity: 1, equipped: false });
  });

  it('adds plain items without an equipped flag', () => {
    const [added] = addGear([], { name: 'Lucky coin', type: 'item', weight: 1 });
    expect(added).not.toHaveProperty('equipped');
  });
});
