export interface ArmorData {
  name: string;
  kind: 'armor' | 'helmet';
  /** Suit rating, or the helmet's bonus on top of it. */
  rating: number;
  /** Bane penalties as rules.md writes them; skills in caps. */
  banes: string[];
  /** Mages can't cast while wearing metal. */
  metal: boolean;
  /** Optional damage-type rule. */
  note?: string;
}

/** Armor and helmets from rules.md § Damage & Death → Armor. */
export const ARMOR_DATA: ArmorData[] = [
  { name: 'Leather', kind: 'armor', rating: 1, banes: [], metal: false, note: '+2 vs bludgeoning' },
  { name: 'Studded Leather', kind: 'armor', rating: 2, banes: ['SNEAKING'], metal: false, note: '+2 vs bludgeoning' },
  { name: 'Chainmail', kind: 'armor', rating: 4, banes: ['EVADE', 'SNEAKING'], metal: true, note: '+2 vs slashing' },
  { name: 'Plate Armor', kind: 'armor', rating: 6, banes: ['ACROBATICS', 'EVADE', 'SNEAKING'], metal: true },
  { name: 'Open Helmet', kind: 'helmet', rating: 1, banes: ['AWARENESS'], metal: true },
  { name: 'Great Helm', kind: 'helmet', rating: 2, banes: ['AWARENESS', 'ranged attacks'], metal: true },
];

/** Normalized alias → reference name (see `normalizeRefName`). */
export const ARMOR_ALIASES: Record<string, string> = {
  leatherarmor: 'Leather',
  studdedleatherarmor: 'Studded Leather',
  chainmailarmor: 'Chainmail',
  plate: 'Plate Armor',
  greathelmet: 'Great Helm',
  helmet: 'Open Helmet',
};
