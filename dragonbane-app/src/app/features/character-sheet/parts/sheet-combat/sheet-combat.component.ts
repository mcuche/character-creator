import { Component, computed, input, output } from '@angular/core';
import { Character, GearItem } from '../../../../models/character.models';
import {
  ArmorProfile, Encumbrance, WeaponProfile, applyAgeModifiers, armorProfile, weaponProfiles,
} from '../../../../services/character-rules.service';
import { IconComponent } from '../../../../shared/icon/icon.component';

/** Weapons at hand and worn armor, read from the same rows the load counts as free. */
@Component({
  selector: 'app-sheet-combat',
  imports: [IconComponent],
  templateUrl: './sheet-combat.component.html',
})
export class SheetCombatComponent {
  readonly character = input.required<Character>();
  readonly encumbrance = input.required<Encumbrance>();
  readonly patch = output<Partial<Character>>();

  readonly weapons = computed(() => weaponProfiles(this.character(), this.encumbrance()));
  readonly armor = computed(() => armorProfile(this.character(), this.encumbrance()));

  /** Age-adjusted STR, for the requirement message. */
  readonly str = computed(() => {
    const c = this.character();
    if (!c.attributes) return null;
    return (c.age ? applyAgeModifiers(c.attributes, c.age) : c.attributes).STR;
  });

  /** Mages can't cast in metal armor. */
  readonly metalBlocksMagic = computed(() => !!this.character().magicSchool && this.armor().metal);

  /** "2D8 +D4 · 1H · STR 13 · Dur 15", or the range for ranged weapons. */
  statLine(p: WeaponProfile): string {
    const d = p.data!;
    const parts = [p.bonus ? `${p.damage} ${p.bonus}` : p.damage!];
    if (d.grip !== '—') parts.push(d.grip);
    if (p.strReq !== null) parts.push(`STR ${p.strReq}`);
    if (d.ranged) parts.push(`${d.range}m`);
    else if (d.durability !== null) parts.push(`Dur ${d.durability}`);
    return parts.join(' · ');
  }

  features(p: WeaponProfile): string {
    return (p.data?.features ?? []).map(f => f[0].toUpperCase() + f.slice(1)).join(', ');
  }

  /** "Plate Armor 6 · Great Helm +2"; helmets add to the suit. */
  pieceLabel(piece: ArmorProfile['pieces'][number]): string {
    if (!piece.data) return `${piece.item.name} (no stats)`;
    const sign = piece.data.kind === 'helmet' ? '+' : '';
    return `${piece.item.name} ${sign}${piece.data.rating}`;
  }

  setDamaged(item: GearItem, on: boolean): void {
    const gear = this.character().gear.map(i => {
      if (i.id !== item.id) return i;
      if (on) return { ...i, damaged: true };
      const { damaged: _, ...rest } = i;
      return rest;
    });
    this.patch.emit({ gear });
  }
}
