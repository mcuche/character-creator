import { Component, computed, input, output, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GearItem, GearType } from '../../models/character.models';
import { Encumbrance } from '../../services/character-rules.service';
import {
  GEAR_TYPES, GEAR_TYPE_LABELS, MAX_AT_HAND, inferGearType, isAtHandType, isEquippable, setEquipped, setGearType,
} from '../../data/gear.data';
import { findArmor, findWeapon, refOptions } from '../../data/gear-stats';

const WEIGHTS = [0, 1, 2, 3];

/** Gear list shared by the wizard gear step and the sheet's gear tab. */
@Component({
  selector: 'app-gear-list',
  imports: [FormsModule, NgTemplateOutlet],
  templateUrl: './gear-list.component.html',
})
export class GearListComponent {
  readonly gear = input.required<GearItem[]>();
  readonly encumbrance = input.required<Encumbrance>();
  /** Age-adjusted STR, for the capacity breakdown; null while attributes are unset. */
  readonly str = input<number | null>(null);
  /** Optional muted line under the breakdown. */
  readonly note = input<string>();
  readonly gearChange = output<GearItem[]>();

  readonly types = GEAR_TYPES;
  readonly typeLabels = GEAR_TYPE_LABELS;
  readonly weights = WEIGHTS;
  readonly maxAtHand = MAX_AT_HAND;

  readonly editingId = signal<string | null>(null);
  readonly newItemName = signal('');

  readonly equipped = computed(() => this.gear().filter(i => this.isEquipped(i)));
  readonly pack = computed(() => this.gear().filter(i => !this.isEquipped(i)));

  isEquipped(item: GearItem): boolean {
    return isEquippable(item.type) && !!item.equipped;
  }

  canEquip(item: GearItem): boolean {
    return isEquippable(item.type);
  }

  equipLabel(item: GearItem): string {
    return isAtHandType(item.type) ? 'At hand' : 'Worn';
  }

  /** A 4th weapon/shield can't be put at hand. */
  atHandLocked(item: GearItem): boolean {
    return isAtHandType(item.type) && !item.equipped && this.encumbrance().atHandCount >= MAX_AT_HAND;
  }

  refOptions(type: GearType): string[] {
    return refOptions(type);
  }

  /** The reference row the name alone resolves to, ignoring any explicit ref. */
  nameMatch(item: GearItem): string | null {
    const byName = { ...item, ref: undefined };
    return (findWeapon(byName) ?? findArmor(byName))?.name ?? null;
  }

  weightLabel(weight: number): string {
    if (weight <= 0) return 'Tiny';
    if (weight === 1) return 'Normal';
    return `Heavy ${weight}`;
  }

  metaLabel(item: GearItem): string {
    const type = GEAR_TYPE_LABELS[item.type];
    return item.type === 'ration' ? type : `${type} · ${this.weightLabel(item.weight)}`;
  }

  /** Short slot note: rations hint, backpack bonus, or a cost above one slot. */
  slotNote(item: GearItem): string | null {
    const slot = this.encumbrance().items[item.id];
    if (item.type === 'ration') return '4 per slot';
    if (!slot) return null;
    if (slot.reason === 'backpack') return slot.slots > 0 ? `+2 capacity · ${this.slots(slot.slots)}` : '+2 capacity';
    if (this.isEquipped(item)) {
      if (!slot.free) return `counts ${this.slots(slot.slots)}`;
      return slot.slots > 0 ? `rest take ${this.slots(slot.slots)}` : null;
    }
    return slot.slots > 1 ? this.slots(slot.slots) : null;
  }

  private slots(n: number): string {
    return n === 1 ? '1 slot' : `${n} slots`;
  }

  // ── Edits ──

  private emit(gear: GearItem[]): void {
    this.gearChange.emit(gear);
  }

  toggleEquipped(item: GearItem, on: boolean): void {
    this.emit(setEquipped(this.gear(), item.id, on));
  }

  toggleEditor(id: string): void {
    this.editingId.update(cur => cur === id ? null : id);
  }

  setType(item: GearItem, type: GearType): void {
    this.emit(setGearType(this.gear(), item.id, type));
  }

  setWeight(item: GearItem, weight: number): void {
    this.emit(this.gear().map(i => i.id === item.id ? { ...i, weight } : i));
  }

  /** An empty choice clears the ref, so the row matches by name again. */
  setRef(item: GearItem, ref: string): void {
    this.emit(this.gear().map(i => {
      if (i.id !== item.id) return i;
      if (ref) return { ...i, ref };
      const { ref: _, ...rest } = i;
      return rest;
    }));
  }

  updateQuantity(item: GearItem, delta: number): void {
    this.emit(this.gear().map(i =>
      i.id === item.id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i
    ));
  }

  removeItem(item: GearItem): void {
    if (this.editingId() === item.id) this.editingId.set(null);
    this.emit(this.gear().filter(i => i.id !== item.id));
  }

  addItem(): void {
    const name = this.newItemName().trim();
    if (!name) return;
    const type = inferGearType(name);
    const added: GearItem = { id: crypto.randomUUID(), name, type, quantity: 1, weight: 1 };
    if (isEquippable(type)) added.equipped = false;
    this.emit([...this.gear(), added]);
    this.newItemName.set('');
  }
}
