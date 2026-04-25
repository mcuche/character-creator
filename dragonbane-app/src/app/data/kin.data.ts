import { Kin } from '../models/character.models';

export interface KinAbility {
  name: string;
  description: string;
  wp: number | 'free';
}

export interface KinData {
  name: Kin;
  diceRange: string;
  move: number;
  innateAbilityName: string;
  innateAbilityDescription: string;
  innateAbilityWP: number | 'free';
  innateAbilities?: KinAbility[];
}

export const KIN_DATA: KinData[] = [
  {
    name: 'Human',
    diceRange: '1–4',
    move: 10,
    innateAbilityName: 'Adaptive',
    innateAbilityDescription: 'Use any skill in place of the normal one (GM approval).',
    innateAbilityWP: 3,
  },
  {
    name: 'Halfling',
    diceRange: '5–7',
    move: 8,
    innateAbilityName: 'Hard to Catch',
    innateAbilityDescription: 'Gain a boon to EVADE when dodging an attack.',
    innateAbilityWP: 3,
  },
  {
    name: 'Dwarf',
    diceRange: '8–9',
    move: 8,
    innateAbilityName: 'Unforgiving',
    innateAbilityDescription: 'Gain a boon when attacking someone who has previously damaged you.',
    innateAbilityWP: 3,
  },
  {
    name: 'Elf',
    diceRange: '10',
    move: 10,
    innateAbilityName: 'Inner Peace',
    innateAbilityDescription: 'During a stretch rest, deep meditation heals an extra D6 HP + D6 WP + 1 condition. You cannot be woken during this rest.',
    innateAbilityWP: 'free',
  },
  {
    name: 'Mallard',
    diceRange: '11',
    move: 8,
    innateAbilityName: 'Ill-Tempered',
    innateAbilityDescription: 'Gain a boon to any non-INT roll and become Angry.',
    innateAbilityWP: 3,
    innateAbilities: [
      { name: 'Ill-Tempered', description: 'Gain a boon to any non-INT roll and become Angry.', wp: 3 },
      { name: 'Webbed Feet', description: 'Gain a boon to SWIMMING and move at full speed in water.', wp: 'free' },
    ],
  },
  {
    name: 'Wolfkin',
    diceRange: '12',
    move: 12,
    innateAbilityName: 'Hunting Instincts',
    innateAbilityDescription: 'Designate a prey; track it by scent for a day. Spend 1 additional WP for a boon on attacks against your prey.',
    innateAbilityWP: 3,
  },
];
