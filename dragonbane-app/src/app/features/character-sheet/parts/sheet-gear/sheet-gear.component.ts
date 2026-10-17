import { Component, computed, input, output } from '@angular/core';
import { Character, GearItem } from '../../../../models/character.models';
import { applyAgeModifiers, computeEncumbrance } from '../../../../services/character-rules.service';
import { GearListComponent } from '../../../../shared/gear-list/gear-list.component';

type Coin = 'gold' | 'silver' | 'copper';

@Component({
  selector: 'app-sheet-gear',
  imports: [GearListComponent],
  templateUrl: './sheet-gear.component.html',
})
export class SheetGearComponent {
  readonly character = input.required<Character>();
  readonly patch = output<Partial<Character>>();

  readonly coins: { key: Coin; label: string }[] = [
    { key: 'gold', label: 'Gold' },
    { key: 'silver', label: 'Silver' },
    { key: 'copper', label: 'Copper' },
  ];

  /** Age-adjusted STR, or null while attributes are unset. */
  readonly str = computed(() => {
    const c = this.character();
    if (!c.attributes) return null;
    return (c.age ? applyAgeModifiers(c.attributes, c.age) : c.attributes).STR;
  });

  readonly encumbrance = computed(() => {
    const c = this.character();
    return computeEncumbrance(c.gear, this.str(), (c.gold ?? 0) + (c.silver ?? 0) + (c.copper ?? 0));
  });

  setGear(gear: GearItem[]): void {
    this.patch.emit({ gear });
  }
  // ── Coin ──

  setCurrency(type: Coin, value: number): void {
    if (!Number.isFinite(value)) return;
    this.patch.emit({ [type]: Math.max(0, Math.floor(value)) });
  }

  updateCurrency(type: Coin, delta: number): void {
    this.setCurrency(type, (this.character()[type] ?? 0) + delta);
  }

  /** Commit a typed amount on change/blur; normalise the field so it never shows a rejected value. */
  commitCurrency(type: Coin, field: HTMLInputElement): void {
    const raw = field.value.trim();
    const parsed = raw === '' ? 0 : Number(raw);
    const next = Number.isFinite(parsed) ? Math.max(0, Math.floor(parsed)) : (this.character()[type] ?? 0);
    field.value = String(next);
    if (next !== (this.character()[type] ?? 0)) this.setCurrency(type, next);
  }
}
