import { AttributeKey, Profession } from '../models/character.models';
import { GearSeed } from './gear.data';

export interface ProfessionData {
  name: Profession;
  diceRange: string;
  keyAttribute: AttributeKey;
  heroicAbilityName: string;
  heroicAbilityDescription: string;
  skills: string[];
  suggestedGear: GearSeed[];
}

export const PROFESSION_DATA: ProfessionData[] = [
  {
    name: 'Artisan',
    diceRange: '1',
    keyAttribute: 'STR',
    heroicAbilityName: 'Master Craftsman',
    heroicAbilityDescription: 'Choose Blacksmith, Carpenter, or Tanner. Gain advanced crafting abilities for your specialty.',
    skills: ['Crafting', 'Bartering', 'Awareness', 'Hammers', 'Axes', 'Persuasion'],
    suggestedGear: [
      { name: 'Warhammer', type: 'weapon' },
      { name: 'Leather Armor', type: 'armor' },
      { name: 'Crafting Tools', type: 'item' },
      { name: 'Backpack', type: 'backpack' },
      { name: 'Rations', type: 'ration', quantity: 'D6' },
    ],
  },
  {
    name: 'Bard',
    diceRange: '2',
    keyAttribute: 'CHA',
    heroicAbilityName: 'Musician',
    heroicAbilityDescription: 'Action: allies within 10m gain a boon OR enemies take a bane until your next turn. Instruments modify range and cost.',
    skills: ['Performance', 'Persuasion', 'Bluffing', 'Myths & Legends', 'Knives', 'Awareness'],
    suggestedGear: [
      { name: 'Dagger', type: 'weapon' },
      { name: 'Instrument', type: 'item' },
      { name: 'Travelling Clothes', type: 'item' },
      { name: 'Rations', type: 'ration', quantity: 'D6' },
    ],
  },
  {
    name: 'Fighter',
    diceRange: '3',
    keyAttribute: 'STR',
    heroicAbilityName: 'Veteran',
    heroicAbilityDescription: 'Keep your last round\'s initiative card instead of drawing a new one.',
    skills: ['Swords', 'Axes', 'Hammers', 'Brawling', 'Evade', 'Awareness'],
    suggestedGear: [
      { name: 'Broadsword', type: 'weapon' },
      { name: 'Chainmail', type: 'armor' },
      { name: 'Open Helmet', type: 'helmet' },
      { name: 'Rations', type: 'ration', quantity: 'D6' },
    ],
  },
  {
    name: 'Hunter',
    diceRange: '4',
    keyAttribute: 'AGL',
    heroicAbilityName: 'Companion',
    heroicAbilityDescription: 'Tame one animal companion. It can scout for free. Spend 3 WP to command it to attack.',
    skills: ['Hunting & Fishing', 'Awareness', 'Bows', 'Sneaking', 'Bushcraft', 'Knives'],
    suggestedGear: [
      { name: 'Longbow', type: 'weapon' },
      { name: 'Quiver (20 arrows)', type: 'item' },
      { name: 'Knife', type: 'weapon' },
      { name: 'Leather Armor', type: 'armor' },
      { name: 'Rations', type: 'ration', quantity: 'D6' },
    ],
  },
  {
    name: 'Knight',
    diceRange: '5',
    keyAttribute: 'STR',
    heroicAbilityName: 'Guardian',
    heroicAbilityDescription: 'Force an enemy to attack you instead of a nearby ally (out of turn, free action).',
    skills: ['Swords', 'Brawling', 'Riding', 'Persuasion', 'Awareness', 'Hammers'],
    suggestedGear: [
      { name: 'Longsword', type: 'weapon' },
      { name: 'Large Shield', type: 'shield' },
      { name: 'Plate Armor', type: 'armor' },
      { name: 'Great Helm', type: 'helmet' },
      { name: 'Rations', type: 'ration', quantity: 'D6' },
    ],
  },
  {
    name: 'Mage',
    diceRange: '6',
    keyAttribute: 'WIL',
    heroicAbilityName: 'Magic',
    heroicAbilityDescription: 'No heroic ability — instead gains a magic school skill, 3 rank 1 spells, and 3 magic tricks.',
    skills: ['Myths & Legends', 'Awareness', 'Staves', 'Languages', 'Spot Hidden', 'Persuasion'],
    suggestedGear: [
      { name: 'Staff', type: 'weapon' },
      { name: 'Grimoire', type: 'item' },
      { name: 'Travelling Robes', type: 'item' },
      { name: 'Rations', type: 'ration', quantity: 'D6' },
    ],
  },
  {
    name: 'Mariner',
    diceRange: '7',
    keyAttribute: 'AGL',
    heroicAbilityName: 'Sea Legs',
    heroicAbilityDescription: 'Spend 1 WP to become immune to water movement penalties for one round (not an action).',
    skills: ['Seamanship', 'Swimming', 'Brawling', 'Knives', 'Awareness', 'Bushcraft'],
    suggestedGear: [
      { name: 'Short Sword', type: 'weapon' },
      { name: 'Rope (10m)', type: 'item' },
      { name: 'Leather Armor', type: 'armor' },
      { name: 'Nautical Tools', type: 'item' },
      { name: 'Rations', type: 'ration', quantity: 'D6' },
    ],
  },
  {
    name: 'Merchant',
    diceRange: '8',
    keyAttribute: 'CHA',
    heroicAbilityName: 'Treasure Hunter',
    heroicAbilityDescription: 'At a crossroads, spend 3 WP to learn the direction of the greatest treasure.',
    skills: ['Bartering', 'Persuasion', 'Bluffing', 'Awareness', 'Riding', 'Languages'],
    suggestedGear: [
      { name: 'Dagger', type: 'weapon' },
      { name: 'Merchant\'s Scales', type: 'item' },
      { name: 'Fine Clothes', type: 'item' },
      { name: 'Coin Purse', type: 'item' },
      { name: 'Rations', type: 'ration', quantity: 'D6' },
    ],
  },
  {
    name: 'Scholar',
    diceRange: '9',
    keyAttribute: 'INT',
    heroicAbilityName: 'Intuition',
    heroicAbilityDescription: 'Spend 3 WP to ask the GM a question about the current situation and receive a helpful (though not complete) answer.',
    skills: ['Myths & Legends', 'Languages', 'Spot Hidden', 'Healing', 'Awareness', 'Staves'],
    suggestedGear: [
      { name: 'Staff', type: 'weapon' },
      { name: 'Grimoire', type: 'item' },
      { name: 'Lantern', type: 'item' },
      { name: 'Ink & Quill', type: 'item' },
      { name: 'Rations', type: 'ration', quantity: 'D6' },
    ],
  },
  {
    name: 'Thief',
    diceRange: '10',
    keyAttribute: 'AGL',
    heroicAbilityName: 'Backstabbing',
    heroicAbilityDescription: 'When in melee within 2m of an ally, your attack counts as a sneak attack (no dodge/parry, boon, +1 damage die). Subtle weapons only.',
    skills: ['Sleight of Hand', 'Sneaking', 'Evade', 'Spot Hidden', 'Knives', 'Bluffing'],
    suggestedGear: [
      { name: 'Knife', type: 'weapon' },
      { name: 'Lockpicks', type: 'item' },
      { name: 'Dark Clothes', type: 'item' },
      { name: 'Short Sword', type: 'weapon' },
      { name: 'Rations', type: 'ration', quantity: 'D6' },
    ],
  },
];
