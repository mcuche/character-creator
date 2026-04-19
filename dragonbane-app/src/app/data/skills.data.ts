import { AttributeKey } from '../models/character.models';

export interface SkillData {
  name: string;
  attribute: AttributeKey;
  notes: string;
}

export const SKILLS_DATA: SkillData[] = [
  { name: 'Acrobatics', attribute: 'AGL', notes: 'Jumping, climbing, balancing' },
  { name: 'Awareness', attribute: 'INT', notes: 'Spot threats; passive GM rolls' },
  { name: 'Bartering', attribute: 'CHA', notes: 'Haggle for better prices' },
  { name: 'Beast Lore', attribute: 'INT', notes: 'Identify animals and monsters' },
  { name: 'Bluffing', attribute: 'CHA', notes: 'Lying and deception' },
  { name: 'Bushcraft', attribute: 'INT', notes: 'Navigate wilderness, make camp, resist cold' },
  { name: 'Crafting', attribute: 'STR', notes: 'Repair gear (one shift + tools)' },
  { name: 'Evade', attribute: 'AGL', notes: 'Dodge attacks; flee combat' },
  { name: 'Healing', attribute: 'INT', notes: 'Revive downed allies; treat wounds' },
  { name: 'Hunting & Fishing', attribute: 'AGL', notes: 'Find and catch food in the wild' },
  { name: 'Languages', attribute: 'INT', notes: 'Understand foreign or ancient languages' },
  { name: 'Myths & Legends', attribute: 'INT', notes: 'Recall lore, history, distant lands' },
  { name: 'Performance', attribute: 'CHA', notes: 'Sing, tell stories, amuse crowds' },
  { name: 'Persuasion', attribute: 'CHA', notes: 'Convince NPCs' },
  { name: 'Riding', attribute: 'AGL', notes: 'Advanced mounted maneuvers' },
  { name: 'Seamanship', attribute: 'INT', notes: 'Navigate vessels' },
  { name: 'Sleight of Hand', attribute: 'AGL', notes: 'Pickpocketing, lockpicking' },
  { name: 'Sneaking', attribute: 'AGL', notes: 'Move undetected' },
  { name: 'Spot Hidden', attribute: 'INT', notes: 'Find concealed things' },
  { name: 'Swimming', attribute: 'AGL', notes: 'Challenging water conditions' },
  { name: 'Axes', attribute: 'STR', notes: 'All axes, including thrown' },
  { name: 'Bows', attribute: 'AGL', notes: 'All bows (not crossbows)' },
  { name: 'Brawling', attribute: 'STR', notes: 'Unarmed combat' },
  { name: 'Crossbows', attribute: 'AGL', notes: 'All crossbows' },
  { name: 'Hammers', attribute: 'STR', notes: 'Warhammers, clubs, maces' },
  { name: 'Knives', attribute: 'AGL', notes: 'Knives and daggers, including thrown' },
  { name: 'Slings', attribute: 'AGL', notes: 'Slings' },
  { name: 'Spears', attribute: 'STR', notes: 'Spears, tridents, lances; includes thrown' },
  { name: 'Staves', attribute: 'AGL', notes: 'Staves' },
  { name: 'Swords', attribute: 'STR', notes: 'All swords' },
];
