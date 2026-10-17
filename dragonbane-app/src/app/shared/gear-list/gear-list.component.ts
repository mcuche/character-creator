import { Component, computed, input, output, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GearItem, GearType } from '../../models/character.models';
import { Encumbrance } from '../../services/character-rules.service';
import {
  GEAR_TYPES, GEAR_TYPE_LABELS, MAX_AT_HAND, inferGearType, isAtHandType, isEquippable, setEquipped, setGearType,
} from '../../data/gear.data';
import { findArmor, findWeapon, refOptions } from '../../data/gear-stats';
import { CatalogItem, addGear, findCatalogItem, searchCatalog } from '../../data/gear-catalog.data';

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

  // ── Add-gear combobox ──
  readonly listOpen = signal(false);
  readonly activeIndex = signal(-1);
  /** Polite announcement after an add, for screen readers. */
  readonly addedMessage = signal('');

  readonly suggestions = computed(() => searchCatalog(this.newItemName()));
  /** The typed name, offered as a custom row when it isn't a catalog entry. */
  readonly customName = computed(() => {
    const name = this.newItemName().trim();
    return name && !findCatalogItem(name) ? name : null;
  });
  /** Suggestions in catalog order, grouped, each with its flat option index. */
  readonly suggestionGroups = computed(() => {
    const groups: { label: string; items: { entry: CatalogItem; index: number }[] }[] = [];
    this.suggestions().forEach((entry, index) => {
      const last = groups.at(-1);
      if (last?.label === entry.group) last.items.push({ entry, index });
      else groups.push({ label: entry.group, items: [{ entry, index }] });
    });
    return groups;
  });
  /** Catalog options, then the custom option. */
  readonly optionCount = computed(() => this.suggestions().length + (this.customName() ? 1 : 0));
  readonly customIndex = computed(() => this.suggestions().length);

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

  // ── Add-gear combobox ──

  optionId(index: number): string {
    return `gear-add-opt-${index}`;
  }

  onQuery(value: string): void {
    this.newItemName.set(value);
    this.listOpen.set(true);
    this.activeIndex.set(value.trim() ? 0 : -1);
  }

  openList(): void {
    this.listOpen.set(true);
  }

  closeList(): void {
    this.listOpen.set(false);
    this.activeIndex.set(-1);
  }

  toggleList(input: HTMLInputElement): void {
    if (this.listOpen()) this.closeList();
    else this.openList();
    input.focus();
  }

  onKeydown(event: KeyboardEvent): void {
    const count = this.optionCount();
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (!this.listOpen()) this.openList();
        else if (count) this.moveActive(i => (i + 1) % count);
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (!this.listOpen()) this.openList();
        else if (count) this.moveActive(i => (i <= 0 ? count : i) - 1);
        break;
      case 'Enter': {
        event.preventDefault();
        const i = this.listOpen() ? this.activeIndex() : -1;
        if (i >= 0 && i < this.suggestions().length) this.pick(this.suggestions()[i]);
        else this.addItem();
        break;
      }
      case 'Escape':
        if (this.listOpen()) {
          event.preventDefault();
          this.closeList();
        }
        break;
    }
  }

  /** Add the typed name: the catalog entry it names exactly, else a custom row. */
  addItem(): void {
    const name = this.newItemName().trim();
    if (!name) return;
    this.pick(findCatalogItem(name) ?? { name, type: inferGearType(name), weight: 1 });
  }

  /** Move the highlight and keep it in view in a long list. */
  private moveActive(step: (i: number) => number): void {
    this.activeIndex.update(step);
    document.getElementById(this.optionId(this.activeIndex()))?.scrollIntoView({ block: 'nearest' });
  }

  pick(entry: Pick<CatalogItem, 'name' | 'type' | 'weight'>): void {
    this.emit(addGear(this.gear(), entry));
    this.addedMessage.set(`Added ${entry.name}`);
    this.newItemName.set('');
    this.closeList();
  }
}
