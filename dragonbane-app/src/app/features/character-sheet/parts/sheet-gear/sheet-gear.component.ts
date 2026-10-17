import { Component, computed, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Character, GearItem } from '../../../../models/character.models';
import { applyAgeModifiers } from '../../../../services/character-rules.service';
import { inferGearType } from '../../../../data/gear.data';

type Coin = 'gold' | 'silver' | 'copper';

/** Weight cycle for the per-item toggle: normal → heavy 2 → heavy 3 → tiny → normal. */
const WEIGHT_CYCLE: Record<number, number> = { 1: 2, 2: 3, 3: 0, 0: 1 };

const BACKPACK = /\bback\s?pack\b/i;

@Component({
  selector: 'app-sheet-gear',
  imports: [FormsModule],
  templateUrl: './sheet-gear.component.html',
})
export class SheetGearComponent {
  readonly character = input.required<Character>();
  readonly patch = output<Partial<Character>>();

  readonly newItemName = signal('');

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

  /** A backpack adds 2 to capacity and doesn't take a slot itself (one at a time). */
  readonly hasBackpack = computed(() => this.character().gear.some(i => BACKPACK.test(i.name)));

  readonly capacity = computed(() => {
    const str = this.str();
    if (str === null) return null;
    return Math.ceil(str / 2) + (this.hasBackpack() ? 2 : 0);
  });

  /** Fewer than 100 coins are free; every full 100 takes one slot. */
  readonly coinLoad = computed(() => {
    const c = this.character();
    return Math.floor(((c.gold ?? 0) + (c.silver ?? 0) + (c.copper ?? 0)) / 100);
  });

  /** Slots used: weight × quantity per item (tiny = 0), one backpack free, plus coin load. */
  readonly load = computed(() => {
    let backpackSkipped = false;
    let total = 0;
    for (const item of this.character().gear) {
      if (!backpackSkipped && BACKPACK.test(item.name)) {
        backpackSkipped = true;
        total += Math.max(0, item.weight) * (item.quantity - 1);
        continue;
      }
      total += Math.max(0, item.weight) * item.quantity;
    }
    return total + this.coinLoad();
  });

  readonly over = computed(() => {
    const cap = this.capacity();
    return cap !== null && this.load() > cap;
  });

  readonly full = computed(() => this.capacity() !== null && this.load() === this.capacity());

  // ── Pack ──

  private setGear(gear: GearItem[]): void {
    this.patch.emit({ gear });
  }

  addItem(): void {
    const name = this.newItemName().trim();
    if (!name) return;
    this.setGear([...this.character().gear, { id: crypto.randomUUID(), name, type: inferGearType(name), quantity: 1, weight: 1 }]);
    this.newItemName.set('');
  }

  removeItem(id: string): void {
    this.setGear(this.character().gear.filter(i => i.id !== id));
  }

  updateQuantity(id: string, delta: number): void {
    this.setGear(this.character().gear.map(i =>
      i.id === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i
    ));
  }

  cycleWeight(id: string): void {
    this.setGear(this.character().gear.map(i =>
      i.id === id ? { ...i, weight: WEIGHT_CYCLE[i.weight] ?? 1 } : i
    ));
  }

  weightLabel(weight: number): string {
    if (weight <= 0) return 'Tiny';
    if (weight === 1) return 'Normal';
    return `Heavy (${weight})`;
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
