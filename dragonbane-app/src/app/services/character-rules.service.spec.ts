import { computeSkills, getBaseChance, getSkillLevel } from './character-rules.service';
import { Attributes } from '../models/character.models';

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
