import { MagicSchool } from '../models/character.models';

export interface SpellData {
  name: string;
  school: MagicSchool | 'General';
  rank: number;
  isTrick: boolean;
  description: string;
}

export const SPELLS_DATA: SpellData[] = [
  // General Magic Tricks
  { name: 'Fetch', school: 'General', rank: 0, isTrick: true, description: 'Float a weight 1 or less object to you.' },
  { name: 'Flick', school: 'General', rank: 0, isTrick: true, description: 'Deal 1 damage to a target within 10m.' },
  { name: 'Light', school: 'General', rank: 0, isTrick: true, description: 'Create a 10m radius light for 1 shift.' },
  { name: 'Open/Close', school: 'General', rank: 0, isTrick: true, description: 'Open or close an unlocked door within 10m.' },
  { name: 'Repair Clothes', school: 'General', rank: 0, isTrick: true, description: 'Instantly repair torn or damaged clothing.' },
  { name: 'Sense Magic', school: 'General', rank: 0, isTrick: true, description: 'Detect magical auras nearby.' },

  // Animism Tricks
  { name: 'Birdsong', school: 'Animism', rank: 0, isTrick: true, description: 'Gain a boon to AWARENESS while outdoors for 1 stretch.' },
  { name: 'Clean', school: 'Animism', rank: 0, isTrick: true, description: 'Instantly clean a room.' },
  { name: 'Cook Food', school: 'Animism', rank: 0, isTrick: true, description: 'Auto-succeed at cooking.' },
  { name: 'Floral Trail', school: 'Animism', rank: 0, isTrick: true, description: 'Leave a trail of flowers in your wake.' },
  { name: 'Hairstyle', school: 'Animism', rank: 0, isTrick: true, description: 'Style hair perfectly; may give a boon to social rolls.' },

  // Elementalism Tricks
  { name: 'Heat/Chill', school: 'Elementalism', rank: 0, isTrick: true, description: 'Protect a target from cold for 1 shift.' },
  { name: 'Ignite', school: 'Elementalism', rank: 0, isTrick: true, description: 'Light or extinguish a flame within 10m.' },
  { name: 'Puff of Smoke', school: 'Elementalism', rank: 0, isTrick: true, description: 'Create a puff of smoke; may give a boon to SNEAKING.' },

  // Mentalism Tricks
  { name: 'Lock/Unlock', school: 'Mentalism', rank: 0, isTrick: true, description: 'Lock or unlock a non-magical lock.' },
  { name: 'Magic Stool', school: 'Mentalism', rank: 0, isTrick: true, description: 'Conjure a floating seat.' },
  { name: 'Slow Fall', school: 'Mentalism', rank: 0, isTrick: true, description: 'Land safely from any height.' },

  // Animism Rank 1 Spells
  { name: 'Animal Whisperer', school: 'Animism', rank: 1, isTrick: false, description: 'Talk with a bird or mammal within 2m; ask questions equal to power level.' },
  { name: 'Banish', school: 'Animism', rank: 1, isTrick: false, description: 'Deal 2D8 + D8/extra level to demons/undead within 10m; no armor, dodge, or parry.' },
  { name: 'Ensnaring Roots', school: 'Animism', rank: 1, isTrick: false, description: 'Trap a target within 10m in roots (EVADE to break free).' },
  { name: 'Lightning Flash', school: 'Animism', rank: 1, isTrick: false, description: 'Deal 2D6 to a target 30m away + chain to nearby target (2D4); +1 die/extra level; ignores metal armor.' },
  { name: 'Treat Wound', school: 'Animism', rank: 1, isTrick: false, description: 'Heal 2D6 HP (+D6/extra level) to a touched target. Can target self.' },

  // Elementalism Rank 1 Spells
  { name: 'Fireball', school: 'Elementalism', rank: 1, isTrick: false, description: 'Deal 2D6 fire damage to a target within 20m (+D6/extra level or extra fireball). Dodged/parried as ranged.' },
  { name: 'Frost', school: 'Elementalism', rank: 1, isTrick: false, description: 'Deal D6 HP + D6 WP to all in a 4m sphere; humanoids are frozen (STR roll each turn to break free).' },
  { name: 'Gust of Wind', school: 'Elementalism', rank: 1, isTrick: false, description: 'Push target 2D4m in a 10m cone + same bludgeoning damage. No effect on Large/Huge monsters.' },
  { name: 'Pillar', school: 'Elementalism', rank: 1, isTrick: false, description: 'Raise a 3m×1m stone pillar within 10m (+3m height/extra level).' },
  { name: 'Shatter', school: 'Elementalism', rank: 1, isTrick: false, description: 'Deal 2D10 to a touched inanimate non-magical item; ignores armor (+D10/extra level).' },

  // Mentalism Rank 1 Spells
  { name: 'Farsight', school: 'Mentalism', rank: 1, isTrick: false, description: 'See and hear a distant location in real time up to 1km (must have visited or have in sight). ×10 range/extra level.' },
  { name: 'Levitate', school: 'Mentalism', rank: 1, isTrick: false, description: 'Float self or a human-sized object/person up to 6m (+2m or +1 target/extra level).' },
  { name: 'Longstrider', school: 'Mentalism', rank: 1, isTrick: false, description: 'Double movement for 1 stretch; +1 target/extra level. Can target self.' },
  { name: 'Power Fist', school: 'Mentalism', rank: 1, isTrick: false, description: 'Unarmed attacks deal +D6/power level for 1 stretch.' },
  { name: 'Stone Skin', school: 'Mentalism', rank: 1, isTrick: false, description: 'Target gains armor 4 (+2/extra level); only the highest armor counts.' },
];

export const MAGIC_SCHOOLS: { name: MagicSchool; theme: string; description: string }[] = [
  {
    name: 'Animism',
    theme: 'Nature & Life',
    description: 'Draw power from the natural world — healing, lightning, roots, and communion with animals.',
  },
  {
    name: 'Elementalism',
    theme: 'Fire, Stone & Wind',
    description: 'Command the raw elements — fire, earth, water, and air — to attack and reshape the world.',
  },
  {
    name: 'Mentalism',
    theme: 'Mind & Matter',
    description: 'Bend reality through willpower — telekinesis, farsight, flight, and control over the physical world.',
  },
];
