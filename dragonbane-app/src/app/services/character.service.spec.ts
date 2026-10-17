import { TestBed } from '@angular/core/testing';
import { CharacterService, parseCharacter, parseCharacterFile } from './character.service';
import { Character } from '../models/character.models';

const EXPORTED: Character = {
  id: 'abc',
  name: 'Ulrik',
  kin: 'Dwarf',
  profession: 'Fighter',
  age: 'Adult',
  attributes: { STR: 15, CON: 14, AGL: 11, INT: 10, WIL: 8, CHA: 17 },
  derivedStats: { hp: 14, wp: 8, movement: 8, strDamageBonus: '+D4', aglDamageBonus: 'none' },
  skills: { Axes: { name: 'Axes', level: 12, trained: true, advancementMarks: 1 } },
  heroicAbilities: ['Veteran'],
  innateAbility: 'Dwarf',
  gear: [{ id: 'g1', name: 'Broadsword', type: 'weapon', quantity: 1, weight: 1, equipped: true }],
  appearance: { hair: 'Braided' },
  currentHP: 10,
  currentWP: 8,
  conditions: ['Angry'],
  preparedSpells: [],
  magicTricks: [],
  gold: 1,
  silver: 2,
  copper: 3,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-02T00:00:00.000Z',
};

describe('parseCharacter', () => {
  it('round-trips an exported character', () => {
    const parsed = parseCharacter(JSON.parse(JSON.stringify(EXPORTED)));
    expect(parsed).toMatchObject({ ...EXPORTED, gear: [expect.objectContaining({ name: 'Broadsword', equipped: true })] });
  });

  it('fills defaults for missing lists and counters', () => {
    const parsed = parseCharacter({ name: 'Bare', skills: {} });
    expect(parsed).toMatchObject({
      name: 'Bare', gear: [], heroicAbilities: [], conditions: [], appearance: {},
      currentHP: 0, gold: 0, preparedSpells: [],
    });
    expect(parsed?.id).toBeTruthy();
  });

  it('rejects values the sheet could not render', () => {
    expect(parseCharacter(null)).toBeNull();
    expect(parseCharacter([EXPORTED])).toBeNull();
    expect(parseCharacter({ ...EXPORTED, name: undefined })).toBeNull();
    expect(parseCharacter({ ...EXPORTED, kin: 'Orc' })).toBeNull();
    expect(parseCharacter({ ...EXPORTED, attributes: { STR: 10 } })).toBeNull();
    expect(parseCharacter({ ...EXPORTED, derivedStats: { hp: '14' } })).toBeNull();
  });

  it('drops malformed skills and unknown conditions', () => {
    const parsed = parseCharacter({ ...EXPORTED, skills: { ...EXPORTED.skills, Bad: { level: 3 } }, conditions: ['Angry', 'Hungry'] });
    expect(Object.keys(parsed!.skills)).toEqual(['Axes']);
    expect(parsed!.conditions).toEqual(['Angry']);
  });
});

describe('parseCharacterFile', () => {
  it('accepts one character or an array of them', () => {
    expect(parseCharacterFile(JSON.stringify(EXPORTED))).toHaveLength(1);
    expect(parseCharacterFile(JSON.stringify([EXPORTED, { ...EXPORTED, id: 'def' }]))).toHaveLength(2);
  });

  it('returns nothing for invalid JSON or any invalid entry', () => {
    expect(parseCharacterFile('not json')).toEqual([]);
    expect(parseCharacterFile('[]')).toEqual([]);
    expect(parseCharacterFile(JSON.stringify([EXPORTED, { name: 1 }]))).toEqual([]);
  });
});

describe('CharacterService.importCharacters', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
  });

  it('adds characters and persists them', () => {
    const service = TestBed.inject(CharacterService);
    service.importCharacters([EXPORTED]);

    expect(service.getById('abc')?.name).toBe('Ulrik');
    expect(JSON.parse(localStorage.getItem('dragonbane_characters')!)).toHaveLength(1);
  });

  it('gives a new id to a character whose id is taken, never overwriting', () => {
    const service = TestBed.inject(CharacterService);
    service.importCharacters([EXPORTED]);
    service.importCharacters([{ ...EXPORTED, name: 'Ulrik again' }]);

    const list = service.characters();
    expect(list).toHaveLength(2);
    expect(list[0]).toMatchObject({ id: 'abc', name: 'Ulrik' });
    expect(list[1].id).not.toBe('abc');
  });
});
