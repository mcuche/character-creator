import { Injectable, signal, computed } from '@angular/core';
import { Age, Appearance, AttributeKey, Character, Condition, DerivedStats, SkillEntry } from '../models/character.models';
import { normalizeGear } from '../data/gear.data';
import { KIN_DATA } from '../data/kin.data';
import { PROFESSION_DATA } from '../data/professions.data';
import { MAGIC_SCHOOLS } from '../data/magic.data';

const STORAGE_KEY = 'dragonbane_characters';

const AGES: Age[] = ['Young', 'Adult', 'Old'];
const ATTRIBUTE_KEYS: AttributeKey[] = ['STR', 'CON', 'AGL', 'INT', 'WIL', 'CHA'];
const CONDITIONS: Condition[] = ['Exhausted', 'Sickly', 'Dazed', 'Angry', 'Scared', 'Disheartened'];

type Json = Record<string, unknown>;

const isObject = (v: unknown): v is Json => typeof v === 'object' && v !== null && !Array.isArray(v);
const isNumber = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const optionalOf = (v: unknown, allowed: readonly string[]) => v === undefined || allowed.includes(v as string);
const optionalString = (v: unknown) => (typeof v === 'string' ? v : undefined);
const strings = (v: unknown) => (Array.isArray(v) ? v.filter((s): s is string => typeof s === 'string') : []);

// Validates one exported character, filling defaults for missing lists.
// Returns null for anything the sheet couldn't render.
export function parseCharacter(raw: unknown): Character | null {
  if (!isObject(raw) || typeof raw['name'] !== 'string' || !isObject(raw['skills'])) return null;

  const { kin, profession, age, magicSchool, attributes, derivedStats, memento, appearance } = raw;
  if (!optionalOf(kin, KIN_DATA.map(k => k.name))) return null;
  if (!optionalOf(profession, PROFESSION_DATA.map(p => p.name))) return null;
  if (!optionalOf(age, AGES)) return null;
  if (!optionalOf(magicSchool, MAGIC_SCHOOLS.map(s => s.name))) return null;
  if (attributes !== undefined && !(isObject(attributes) && ATTRIBUTE_KEYS.every(k => isNumber(attributes[k])))) return null;
  if (derivedStats !== undefined && !(isObject(derivedStats) && ['hp', 'wp', 'movement'].every(k => isNumber(derivedStats[k])))) return null;

  const skills: Record<string, SkillEntry> = {};
  for (const entry of Object.values(raw['skills'])) {
    if (!isObject(entry) || typeof entry['name'] !== 'string' || !isNumber(entry['level'])) continue;
    skills[entry['name']] = {
      name: entry['name'],
      level: entry['level'],
      trained: entry['trained'] === true,
      advancementMarks: isNumber(entry['advancementMarks']) ? entry['advancementMarks'] : 0,
    };
  }

  const derived = derivedStats as DerivedStats | undefined;
  const now = new Date().toISOString();
  return {
    id: typeof raw['id'] === 'string' && raw['id'] ? raw['id'] : crypto.randomUUID(),
    name: raw['name'],
    kin: kin as Character['kin'],
    profession: profession as Character['profession'],
    age: age as Character['age'],
    attributes: attributes as Character['attributes'],
    derivedStats: derived,
    skills,
    heroicAbilities: strings(raw['heroicAbilities']),
    innateAbility: optionalString(raw['innateAbility']),
    weakness: optionalString(raw['weakness']),
    gear: normalizeGear(Array.isArray(raw['gear']) ? raw['gear'].filter(isObject) : []),
    memento: isObject(memento) && typeof memento['name'] === 'string'
      ? { name: memento['name'], significance: optionalString(memento['significance']) ?? '' }
      : undefined,
    appearance: isObject(appearance)
      ? (Object.fromEntries(Object.entries(appearance).filter(([, v]) => typeof v === 'string')) as Appearance)
      : {},
    currentHP: isNumber(raw['currentHP']) ? raw['currentHP'] : derived?.hp ?? 0,
    currentWP: isNumber(raw['currentWP']) ? raw['currentWP'] : derived?.wp ?? 0,
    conditions: strings(raw['conditions']).filter((c): c is Condition => CONDITIONS.includes(c as Condition)),
    magicSchool: magicSchool as Character['magicSchool'],
    preparedSpells: strings(raw['preparedSpells']),
    magicTricks: strings(raw['magicTricks']),
    gold: isNumber(raw['gold']) ? raw['gold'] : 0,
    silver: isNumber(raw['silver']) ? raw['silver'] : 0,
    copper: isNumber(raw['copper']) ? raw['copper'] : 0,
    createdAt: optionalString(raw['createdAt']) ?? now,
    updatedAt: optionalString(raw['updatedAt']) ?? now,
  };
}

// A file holds one exported character, or an array of them.
// Returns [] if the text isn't JSON or any entry isn't a character.
export function parseCharacterFile(text: string): Character[] {
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    return [];
  }
  const parsed = (Array.isArray(json) ? json : [json]).map(parseCharacter);
  return parsed.length && parsed.every(c => c !== null) ? (parsed as Character[]) : [];
}

@Injectable({ providedIn: 'root' })
export class CharacterService {
  private _characters = signal<Character[]>(this.load());

  readonly characters = this._characters.asReadonly();
  readonly count = computed(() => this._characters().length);

  private load(): Character[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const list: Character[] = raw ? JSON.parse(raw) : [];
      // Older saves lack gear types and equipped flags; the next save stores them
      return list.map(c => ({ ...c, gear: normalizeGear(c.gear ?? []) }));
    } catch {
      return [];
    }
  }

  private save(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this._characters()));
  }

  getById(id: string): Character | undefined {
    return this._characters().find(c => c.id === id);
  }

  add(character: Character): void {
    this._characters.update(list => [...list, character]);
    this.save();
  }

  update(character: Character): void {
    this._characters.update(list =>
      list.map(c => c.id === character.id ? { ...character, updatedAt: new Date().toISOString() } : c)
    );
    this.save();
  }

  // Imports never overwrite: a character whose id is already taken gets a new one
  importCharacters(characters: Character[]): void {
    const taken = new Set(this._characters().map(c => c.id));
    const fresh = characters.map(c => {
      const id = taken.has(c.id) ? crypto.randomUUID() : c.id;
      taken.add(id);
      return { ...c, id };
    });
    this._characters.update(list => [...list, ...fresh]);
    this.save();
  }

  delete(id: string): void {
    this._characters.update(list => list.filter(c => c.id !== id));
    this.save();
  }
}
