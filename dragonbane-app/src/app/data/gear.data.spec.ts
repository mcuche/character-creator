import { autoEquip, inferGearType, normalizeGear, setEquipped, setGearType } from './gear.data';
import { PROFESSION_DATA } from './professions.data';
import { GearItem, GearType } from '../models/character.models';

const item = (id: string, type: GearType, extra: Partial<GearItem> = {}): GearItem =>
  ({ id, name: id, type, quantity: 1, weight: 1, ...extra });

describe('inferGearType', () => {
  it('matches every suggested-gear seed', () => {
    for (const prof of PROFESSION_DATA) {
      for (const seed of prof.suggestedGear) {
        expect(inferGearType(seed.name), `${prof.name}: ${seed.name}`).toBe(seed.type);
      }
    }
  });

  it('leaves tools, quivers and lockpicks as items', () => {
    expect(inferGearType('Lockpicks')).toBe('item');
    expect(inferGearType('Quiver (20 arrows)')).toBe('item');
    expect(inferGearType('Crafting Tools')).toBe('item');
  });

  it('recognises common names', () => {
    expect(inferGearType('Back pack')).toBe('backpack');
    expect(inferGearType('D6 rations')).toBe('ration');
    expect(inferGearType('Great Helm')).toBe('helmet');
    expect(inferGearType('Chain mail')).toBe('armor');
    expect(inferGearType('Leather Armour')).toBe('armor');
    expect(inferGearType('War pick')).toBe('weapon');
    expect(inferGearType('Lantern')).toBe('item');
  });
});

describe('autoEquip', () => {
  it('equips the first 3 weapons/shields, the first armor and the first helmet', () => {
    const gear = autoEquip([
      item('w1', 'weapon'), item('a1', 'armor'), item('s1', 'shield'), item('w2', 'weapon'),
      item('w3', 'weapon'), item('a2', 'armor'), item('h1', 'helmet'), item('h2', 'helmet'), item('rope', 'item'),
    ]);
    const on = gear.filter(i => i.equipped).map(i => i.id);
    expect(on).toEqual(['w1', 'a1', 's1', 'w2', 'h1']);
    expect(gear.find(i => i.id === 'w3')!.equipped).toBe(false);
    expect(gear.find(i => i.id === 'a2')!.equipped).toBe(false);
    expect('equipped' in gear.find(i => i.id === 'rope')!).toBe(false);
  });
});

describe('setEquipped', () => {
  it('swaps worn armor', () => {
    const gear = setEquipped([item('a1', 'armor', { equipped: true }), item('a2', 'armor', { equipped: false })], 'a2', true);
    expect(gear.map(i => i.equipped)).toEqual([false, true]);
  });

  it('refuses a 4th weapon at hand, and unchecking frees a place', () => {
    let gear = [
      item('w1', 'weapon', { equipped: true }), item('w2', 'weapon', { equipped: true }),
      item('s1', 'shield', { equipped: true }), item('w4', 'weapon', { equipped: false }),
    ];
    gear = setEquipped(gear, 'w4', true);
    expect(gear[3].equipped).toBe(false);
    gear = setEquipped(gear, 'w1', false);
    gear = setEquipped(gear, 'w4', true);
    expect(gear.map(i => i.equipped)).toEqual([false, true, true, true]);
  });
});

describe('setGearType', () => {
  it('starts equippable types unchecked and drops the flag otherwise', () => {
    const gear = setGearType([item('x', 'item')], 'x', 'weapon');
    expect(gear[0]).toMatchObject({ type: 'weapon', equipped: false });
    const back = setGearType([item('x', 'weapon', { equipped: true })], 'x', 'item');
    expect(back[0].type).toBe('item');
    expect('equipped' in back[0]).toBe(false);
  });

  it('drops the stats ref and damaged flag', () => {
    const gear = setGearType([item('x', 'weapon', { ref: 'Longsword', damaged: true })], 'x', 'shield');
    expect('ref' in gear[0]).toBe(false);
    expect('damaged' in gear[0]).toBe(false);
  });
});

describe('normalizeGear', () => {
  it('infers types and auto-equips legacy items, keeping ids and quantities', () => {
    const legacy = [
      { id: 'a', name: 'Dagger', quantity: 2, weight: 1 },
      { id: 'b', name: 'Leather Armor', quantity: 1, weight: 1 },
      { id: 'c', name: 'Rope (10m)', quantity: 1, weight: 1 },
    ] as Partial<GearItem>[];
    expect(normalizeGear(legacy)).toEqual([
      { id: 'a', name: 'Dagger', type: 'weapon', quantity: 2, weight: 1, equipped: true },
      { id: 'b', name: 'Leather Armor', type: 'armor', quantity: 1, weight: 1, equipped: true },
      { id: 'c', name: 'Rope (10m)', type: 'item', quantity: 1, weight: 1 },
    ]);
  });

  it('leaves existing equipped flags alone', () => {
    const gear = [item('w', 'weapon', { equipped: false }), item('a', 'armor', { equipped: false })];
    expect(normalizeGear(gear)).toEqual(gear);
  });

  it('fills missing weight, quantity and id', () => {
    const [g] = normalizeGear([{ name: 'Torch' }]);
    expect(g).toMatchObject({ name: 'Torch', type: 'item', quantity: 1, weight: 1 });
    expect(g.id).toBeTruthy();
  });
});
