export type Kin = 'Human' | 'Halfling' | 'Dwarf' | 'Elf' | 'Mallard' | 'Wolfkin';
export type Profession = 'Artisan' | 'Bard' | 'Fighter' | 'Hunter' | 'Knight' | 'Mage' | 'Mariner' | 'Merchant' | 'Scholar' | 'Thief';
export type Age = 'Young' | 'Adult' | 'Old';
export type MagicSchool = 'Animism' | 'Elementalism' | 'Mentalism';
export type Condition = 'Exhausted' | 'Sickly' | 'Dazed' | 'Angry' | 'Scared' | 'Disheartened';
export type AttributeKey = 'STR' | 'CON' | 'AGL' | 'INT' | 'WIL' | 'CHA';

export interface Attributes {
  STR: number;
  CON: number;
  AGL: number;
  INT: number;
  WIL: number;
  CHA: number;
}

export interface DerivedStats {
  hp: number;
  wp: number;
  movement: number;
  strDamageBonus: string;
  aglDamageBonus: string;
}

export interface SkillEntry {
  name: string;
  level: number;
  trained: boolean;
  advancementMarks: number;
}

export type GearType = 'item' | 'weapon' | 'shield' | 'armor' | 'helmet' | 'ration' | 'backpack';

export interface GearItem {
  id: string;
  name: string;
  type: GearType;
  quantity: number;
  weight: number; // 0 = tiny, 1 = normal, 2+ = heavy
  /** "At hand" for weapon/shield, "worn" for armor/helmet; ignored for other types. */
  equipped?: boolean;
  notes?: string;
}

export interface Memento {
  name: string;
  significance: string;
}

export interface Appearance {
  height?: string;
  build?: string;
  hair?: string;
  eyes?: string;
  skin?: string;
  distinguishingFeatures?: string;
}

export interface Character {
  id: string;
  name: string;
  kin?: Kin;
  profession?: Profession;
  age?: Age;
  attributes?: Attributes;
  derivedStats?: DerivedStats;
  skills: Record<string, SkillEntry>;
  heroicAbilities: string[];
  innateAbility?: string;
  weakness?: string;
  gear: GearItem[];
  memento?: Memento;
  appearance: Appearance;
  currentHP: number;
  currentWP: number;
  conditions: Condition[];
  magicSchool?: MagicSchool;
  preparedSpells: string[];
  magicTricks: string[];
  gold: number;
  silver: number;
  copper: number;
  createdAt: string;
  updatedAt: string;
}

export type CharacterDraft = Partial<Character> & {
  attributeGenerationMethod?: 'roll' | 'pointbuy' | 'standard';
  pointBuyRemaining?: number;
  step?: string;
  wizardFurthestStep?: string;
};
