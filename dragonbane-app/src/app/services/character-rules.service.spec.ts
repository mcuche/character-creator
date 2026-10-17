import { applyAttributeEdit, computeEncumbrance, computeSkills, deriveStats, getBaseChance, getSkillLevel } from './character-rules.service';
import { Age, Attributes, Character, GearItem, GearType } from '../models/character.models';
import { autoEquip } from '../data/gear.data';

const ATTRS: Attributes = { STR: 10, CON: 14, AGL: 12, INT: 15, WIL: 17, CHA: 8 };

describe('getBaseChance', () => {
  it('follows the base chance table', () => {
    expect([5, 6, 8, 9, 12, 13, 15, 16, 18].map(getBaseChance)).toEqual([3, 4, 4, 5, 5, 6, 6, 7, 7]);
  });
});

describe('getSkillLevel', () => {
  it('is base chance when untrained and 2× base chance when trained', () => {
    expect(getSkillLevel(17, false)).toBe(7);
    expect(getSkillLevel(17, true)).toBe(14);
  });
});

describe('computeSkills', () => {
  it('starts every skill untrained at base chance', () => {
    const skills = computeSkills(ATTRS, 'Adult');
    expect(Object.keys(skills)).toHaveLength(30);
    expect(skills['Awareness']).toEqual({ name: 'Awareness', level: 6, trained: false, advancementMarks: 0 });
    expect(skills['Bartering'].level).toBe(4);
  });

  it('doubles base chance for trained skills only', () => {
    const skills = computeSkills(ATTRS, 'Adult', ['Awareness']);
    expect(skills['Awareness']).toMatchObject({ level: 12, trained: true });
    expect(skills['Beast Lore']).toMatchObject({ level: 6, trained: false });
  });

  it('never exceeds the creation maximum of 14', () => {
    const maxed: Attributes = { STR: 18, CON: 18, AGL: 18, INT: 18, WIL: 18, CHA: 18 };
    const all = computeSkills(maxed, 'Adult', Object.keys(computeSkills(maxed, 'Adult')));
    expect(Math.max(...Object.values(all).map(s => s.level))).toBe(14);
  });

  it('uses age-modified attributes', () => {
    // AGL 12 → base chance 5; Young adds +1 AGL → 13 → base chance 6
    expect(computeSkills(ATTRS, 'Adult', ['Acrobatics'])['Acrobatics'].level).toBe(10);
    expect(computeSkills(ATTRS, 'Young', ['Acrobatics'])['Acrobatics'].level).toBe(12);
  });

  it('adds the magic school as a trained WIL skill', () => {
    const skills = computeSkills(ATTRS, 'Adult', [], 'Animism');
    expect(skills['Animism']).toEqual({ name: 'Animism', level: 14, trained: true, advancementMarks: 0 });
    expect(computeSkills(ATTRS, 'Adult')['Animism']).toBeUndefined();
  });
});

describe('applyAttributeEdit', () => {
  function makeChar(age: Age, overrides: Partial<Character> = {}): Character {
    const derivedStats = deriveStats(ATTRS, 'Human', age);
    return {
      id: 'c1', name: 'Test', kin: 'Human', profession: 'Mage', age,
      attributes: ATTRS, derivedStats,
      skills: computeSkills(ATTRS, age, ['Acrobatics'], 'Animism'),
      heroicAbilities: [], gear: [], appearance: {}, conditions: [],
      currentHP: derivedStats.hp, currentWP: derivedStats.wp,
      magicSchool: 'Animism', preparedSpells: [], magicTricks: [],
      gold: 0, silver: 0, copper: 0, createdAt: '', updatedAt: '',
      ...overrides,
    };
  }

  it('stores the raw score behind a Young age bonus', () => {
    // Young: CON 14 → 15 shown; setting the shown value to 12 stores 11
    const next = applyAttributeEdit(makeChar('Young'), 'CON', 12);
    expect(next.attributes!.CON).toBe(11);
    expect(next.derivedStats!.hp).toBe(12);
  });

  it('stores the raw score behind an Old age penalty', () => {
    // Old: STR 10 → 8 shown; setting the shown value to 14 stores 16
    const next = applyAttributeEdit(makeChar('Old'), 'STR', 14);
    expect(next.attributes!.STR).toBe(16);
    expect(next.derivedStats!.strDamageBonus).toBe('+D4');
  });

  it('clamps current HP and WP to the new maxima', () => {
    const lowCon = applyAttributeEdit(makeChar('Adult'), 'CON', 9);
    expect(lowCon.derivedStats!.hp).toBe(9);
    expect(lowCon.currentHP).toBe(9);
    expect(lowCon.currentWP).toBe(17);
    const lowWil = applyAttributeEdit(makeChar('Adult'), 'WIL', 11);
    expect(lowWil.currentWP).toBe(11);
  });

  it('does not refill current HP when the maximum rises', () => {
    const next = applyAttributeEdit(makeChar('Adult', { currentHP: 5 }), 'CON', 16);
    expect(next.derivedStats!.hp).toBe(16);
    expect(next.currentHP).toBe(5);
  });

  it('recomputes untrained skills and keeps trained levels', () => {
    const char = makeChar('Adult');
    char.skills['Acrobatics'] = { ...char.skills['Acrobatics'], level: 13, advancementMarks: 1 };
    const next = applyAttributeEdit(char, 'AGL', 16);
    expect(next.skills['Acrobatics']).toMatchObject({ level: 13, trained: true, advancementMarks: 1 });
    expect(next.skills['Evade']).toMatchObject({ level: 7, trained: false });
    expect(next.skills['Animism'].level).toBe(14);
  });

  it('keeps the stored score within 1..18', () => {
    expect(applyAttributeEdit(makeChar('Old'), 'STR', 30).attributes!.STR).toBe(18);
    expect(applyAttributeEdit(makeChar('Young'), 'AGL', 0).attributes!.AGL).toBe(1);
  });
});

describe('computeEncumbrance', () => {
  const item = (id: string, type: GearType, extra: Partial<GearItem> = {}): GearItem =>
    ({ id, name: id, type, quantity: 1, weight: 1, ...extra });
  const load = (gear: GearItem[], coins = 0) => computeEncumbrance(gear, 10, coins).load;

  it('carries a knight kit for the cost of its rations', () => {
    const kit = autoEquip([
      item('sword', 'weapon'), item('shield', 'shield'), item('plate', 'armor'),
      item('helm', 'helmet'), item('rations', 'ration', { quantity: 4 }),
    ]);
    const enc = computeEncumbrance(kit, 10, 0);
    expect(enc.load).toBe(1);
    expect(enc.items['plate']).toEqual({ slots: 0, free: true, reason: 'worn' });
    expect(enc.items['sword']).toEqual({ slots: 0, free: true, reason: 'at hand' });
  });

  it('counts weapons that are not at hand', () => {
    expect(load([item('w', 'weapon', { equipped: false })])).toBe(1);
  });

  it('frees one unit of an equipped row', () => {
    expect(load([item('dagger', 'weapon', { equipped: true, quantity: 2 })])).toBe(1);
  });

  it('frees at most 3 at hand, shields included', () => {
    const four = ['a', 'b', 'c', 'd'].map(id => item(id, 'weapon', { equipped: true }));
    const enc = computeEncumbrance(four, 10, 0);
    expect(enc.load).toBe(1);
    expect(enc.items['d'].free).toBe(false);
    expect(enc.atHandCount).toBe(4);

    const withShield = [item('s', 'shield', { equipped: true }), ...four.slice(0, 3)];
    expect(load(withShield)).toBe(1);
  });

  it('counts unworn armor at its weight, and only one worn armor is free', () => {
    expect(load([item('plate', 'armor', { equipped: false, weight: 2 })])).toBe(2);
    const two = [item('a1', 'armor', { equipped: true }), item('a2', 'armor', { equipped: true })];
    const enc = computeEncumbrance(two, 10, 0);
    expect(enc.load).toBe(1);
    expect(enc.items['a2'].free).toBe(false);
  });

  it('pools rations at 4 per slot', () => {
    expect(load([item('r', 'ration', { quantity: 4 })])).toBe(1);
    expect(load([item('r', 'ration', { quantity: 3 }), item('r2', 'ration', { quantity: 2 })])).toBe(2);
    expect(load([])).toBe(0);
    expect(computeEncumbrance([item('r', 'ration', { quantity: 5 })], 10, 0).rationSlots).toBe(2);
  });

  it('adds 2 for one free backpack; a second backpack counts', () => {
    const enc = computeEncumbrance([item('bp', 'backpack')], 10, 0);
    expect(enc).toMatchObject({ capacity: 7, load: 0, hasBackpack: true });
    expect(computeEncumbrance([item('bp', 'backpack'), item('bp2', 'backpack')], 10, 0)).toMatchObject({ capacity: 7, load: 1 });
  });

  it('weighs tiny and heavy items', () => {
    expect(load([item('ring', 'item', { weight: 0, quantity: 3 })])).toBe(0);
    expect(load([item('anvil', 'item', { weight: 2, quantity: 2 })])).toBe(4);
  });

  it('charges a slot per full 100 coins', () => {
    expect(load([], 99)).toBe(0);
    expect(load([], 100)).toBe(1);
    expect(load([], 250)).toBe(2);
  });

  it('has no capacity without STR, and is never over', () => {
    const enc = computeEncumbrance([item('anvil', 'item', { weight: 3 })], null, 0);
    expect(enc).toMatchObject({ capacity: null, over: false, full: false, load: 3 });
  });

  it('flags full and over against ⌈STR / 2⌉', () => {
    expect(computeEncumbrance([item('a', 'item', { quantity: 6 })], 11, 0)).toMatchObject({ capacity: 6, full: true, over: false });
    expect(computeEncumbrance([item('a', 'item', { quantity: 7 })], 11, 0)).toMatchObject({ full: false, over: true });
  });
});
