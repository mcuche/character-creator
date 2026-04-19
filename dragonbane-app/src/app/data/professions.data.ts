import { AttributeKey, Profession } from '../models/character.models';

export interface ProfessionData {
  name: Profession;
  diceRange: string;
  keyAttribute: AttributeKey;
  heroicAbilityName: string;
  heroicAbilityDescription: string;
  skills: string[];
  suggestedGear: string[];
}

export const PROFESSION_DATA: ProfessionData[] = [
  {
    name: 'Artisan',
    diceRange: '1',
    keyAttribute: 'STR',
    heroicAbilityName: 'Master Craftsman',
    heroicAbilityDescription: 'Choose Blacksmith, Carpenter, or Tanner. Gain advanced crafting abilities for your specialty.',
    skills: ['Crafting', 'Bartering', 'Awareness', 'Hammers', 'Axes', 'Persuasion'],
    suggestedGear: ['Warhammer', 'Leather Armor', 'Crafting Tools', 'Backpack', 'D6 rations'],
  },
  {
    name: 'Bard',
    diceRange: '2',
    keyAttribute: 'CHA',
    heroicAbilityName: 'Musician',
    heroicAbilityDescription: 'Action: allies within 10m gain a boon OR enemies take a bane until your next turn. Instruments modify range and cost.',
    skills: ['Performance', 'Persuasion', 'Bluffing', 'Myths & Legends', 'Knives', 'Awareness'],
    suggestedGear: ['Dagger', 'Instrument', 'Travelling Clothes', 'D6 rations'],
  },
  {
    name: 'Fighter',
    diceRange: '3',
    keyAttribute: 'STR',
    heroicAbilityName: 'Veteran',
    heroicAbilityDescription: 'Keep your last round\'s initiative card instead of drawing a new one.',
    skills: ['Swords', 'Axes', 'Hammers', 'Brawling', 'Evade', 'Awareness'],
    suggestedGear: ['Broadsword', 'Chainmail', 'Open Helmet', 'D6 rations'],
  },
  {
    name: 'Hunter',
    diceRange: '4',
    keyAttribute: 'AGL',
    heroicAbilityName: 'Companion',
    heroicAbilityDescription: 'Tame one animal companion. It can scout for free. Spend 3 WP to command it to attack.',
    skills: ['Hunting & Fishing', 'Awareness', 'Bows', 'Sneaking', 'Bushcraft', 'Knives'],
    suggestedGear: ['Longbow', 'Quiver (20 arrows)', 'Knife', 'Leather Armor', 'D6 rations'],
  },
  {
    name: 'Knight',
    diceRange: '5',
    keyAttribute: 'STR',
    heroicAbilityName: 'Guardian',
    heroicAbilityDescription: 'Force an enemy to attack you instead of a nearby ally (out of turn, free action).',
    skills: ['Swords', 'Brawling', 'Riding', 'Persuasion', 'Awareness', 'Hammers'],
    suggestedGear: ['Longsword', 'Large Shield', 'Plate Armor', 'Great Helm', 'D6 rations'],
  },
  {
    name: 'Mage',
    diceRange: '6',
    keyAttribute: 'WIL',
    heroicAbilityName: 'Magic',
    heroicAbilityDescription: 'No heroic ability — instead gains a magic school skill, 3 rank 1 spells, and 3 magic tricks.',
    skills: ['Myths & Legends', 'Awareness', 'Staves', 'Languages', 'Spot Hidden', 'Persuasion'],
    suggestedGear: ['Staff', 'Grimoire', 'Travelling Robes', 'D6 rations'],
  },
  {
    name: 'Mariner',
    diceRange: '7',
    keyAttribute: 'AGL',
    heroicAbilityName: 'Sea Legs',
    heroicAbilityDescription: 'Spend 1 WP to become immune to water movement penalties for one round (not an action).',
    skills: ['Seamanship', 'Swimming', 'Brawling', 'Knives', 'Awareness', 'Bushcraft'],
    suggestedGear: ['Short Sword', 'Rope (10m)', 'Leather Armor', 'Nautical Tools', 'D6 rations'],
  },
  {
    name: 'Merchant',
    diceRange: '8',
    keyAttribute: 'CHA',
    heroicAbilityName: 'Treasure Hunter',
    heroicAbilityDescription: 'At a crossroads, spend 3 WP to learn the direction of the greatest treasure.',
    skills: ['Bartering', 'Persuasion', 'Bluffing', 'Awareness', 'Riding', 'Languages'],
    suggestedGear: ['Dagger', 'Merchant\'s Scales', 'Fine Clothes', 'Coin Purse', 'D6 rations'],
  },
  {
    name: 'Scholar',
    diceRange: '9',
    keyAttribute: 'INT',
    heroicAbilityName: 'Intuition',
    heroicAbilityDescription: 'Spend 3 WP to ask the GM a question about the current situation and receive a helpful (though not complete) answer.',
    skills: ['Myths & Legends', 'Languages', 'Spot Hidden', 'Healing', 'Awareness', 'Staves'],
    suggestedGear: ['Staff', 'Grimoire', 'Lantern', 'Ink & Quill', 'D6 rations'],
  },
  {
    name: 'Thief',
    diceRange: '10',
    keyAttribute: 'AGL',
    heroicAbilityName: 'Backstabbing',
    heroicAbilityDescription: 'When in melee within 2m of an ally, your attack counts as a sneak attack (no dodge/parry, boon, +1 damage die). Subtle weapons only.',
    skills: ['Sleight of Hand', 'Sneaking', 'Evade', 'Spot Hidden', 'Knives', 'Bluffing'],
    suggestedGear: ['Knife', 'Lockpicks', 'Dark Clothes', 'Short Sword', 'D6 rations'],
  },
];
