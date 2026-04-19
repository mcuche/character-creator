import { Component, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CharacterDraftService } from '../../../../services/character-draft.service';
import { Attributes, AttributeKey, Age } from '../../../../models/character.models';
import { StepNavComponent } from '../../../../shared/step-nav/step-nav.component';
import { ConfirmModalComponent } from '../../../../shared/confirm-modal/confirm-modal.component';
import {
  DiceRoll,
  roll4d6DropLowestDetailed,
  applyAgeModifiers,
  POINT_BUY_BUDGET,
  POINT_BUY_MIN,
  POINT_BUY_MAX,
  STANDARD_ARRAY,
  pointBuyCost,
  pointBuyCostDelta,
} from '../../../../services/character-rules.service';

const ATTR_KEYS: AttributeKey[] = ['STR', 'CON', 'AGL', 'INT', 'WIL', 'CHA'];
const ATTR_LABELS: Record<AttributeKey, string> = {
  STR: 'Strength', CON: 'Constitution', AGL: 'Agility', INT: 'Intelligence', WIL: 'Willpower', CHA: 'Charisma',
};

@Component({
  selector: 'app-attributes',
  imports: [CommonModule, FormsModule, StepNavComponent, ConfirmModalComponent],
  templateUrl: './attributes.component.html',
})
export class AttributesComponent {
  private draftService = inject(CharacterDraftService);
  private router = inject(Router);

  readonly draft = this.draftService.draft;
  readonly attrKeys = ATTR_KEYS;
  readonly attrLabels = ATTR_LABELS;
  readonly POINT_BUY_MIN = POINT_BUY_MIN;
  readonly POINT_BUY_MAX = POINT_BUY_MAX;
  readonly POINT_BUY_BUDGET = POINT_BUY_BUDGET;
  readonly STANDARD_ARRAY = STANDARD_ARRAY;

  mode = signal<'roll' | 'pointbuy' | 'standard'>('roll');
  showModeWarning = signal(false);
  pendingMode = signal<'roll' | 'pointbuy' | 'standard' | null>(null);

  // Roll mode state
  rolledScores = signal<DiceRoll[]>([]);
  assignments = signal<Partial<Record<AttributeKey, number>>>({});
  swapState = signal<AttributeKey[]>([]);

  // Point buy state
  pointBuyValues = signal<Record<AttributeKey, number>>({
    STR: 6, CON: 6, AGL: 6, INT: 6, WIL: 6, CHA: 6,
  });

  constructor() {
    const draft = this.draft();
    if (draft.attributes) {
      if (draft.attributeGenerationMethod === 'pointbuy') {
        this.mode.set('pointbuy');
        this.pointBuyValues.set({ ...draft.attributes });
      } else if (draft.attributeGenerationMethod === 'standard') {
        this.mode.set('standard');
      } else {
        this.mode.set('roll');
      }
    }
  }

  get age(): Age | undefined {
    return this.draft().age;
  }

  get hasDownstreamData(): boolean {
    return !!this.draft().derivedStats;
  }

  switchMode(m: 'roll' | 'pointbuy' | 'standard'): void {
    if (m === this.mode()) return;
    if (this.hasDownstreamData) {
      this.pendingMode.set(m);
      this.showModeWarning.set(true);
    } else {
      this.mode.set(m);
    }
  }

  confirmModeSwitch(): void {
    const m = this.pendingMode();
    if (m) this.mode.set(m);
    this.showModeWarning.set(false);
    this.pendingMode.set(null);
    this.rolledScores.set([]);
    this.assignments.set({});
  }

  cancelModeSwitch(): void {
    this.showModeWarning.set(false);
    this.pendingMode.set(null);
  }

  // --- Roll mode ---

  rollAll(): void {
    this.rolledScores.set(ATTR_KEYS.map(() => roll4d6DropLowestDetailed()));
    this.assignments.set({});
    this.swapState.set([]);
  }

  assignScore(attr: AttributeKey, roll: DiceRoll): void {
    this.assignments.set({ ...this.assignments(), [attr]: roll.total });
  }

  unassign(attr: AttributeKey): void {
    const a = { ...this.assignments() };
    delete a[attr];
    this.assignments.set(a);
    this.swapState.set([]);
  }

  get availableScores(): DiceRoll[] {
    const remaining = [...Object.values(this.assignments())];
    return this.rolledScores().filter(r => {
      const idx = remaining.indexOf(r.total);
      if (idx !== -1) { remaining.splice(idx, 1); return false; }
      return true;
    });
  }

  toggleSwap(attr: AttributeKey): void {
    const swap = this.swapState();
    if (swap.includes(attr)) {
      this.swapState.set(swap.filter(a => a !== attr));
      return;
    }
    if (swap.length < 2) {
      const newSwap = [...swap, attr];
      this.swapState.set(newSwap);
      if (newSwap.length === 2) {
        const a = { ...this.assignments() };
        const [k1, k2] = newSwap;
        [a[k1], a[k2]] = [a[k2]!, a[k1]!];
        this.assignments.set(a);
        this.swapState.set([]);
      }
    }
  }

  get rollAssignmentComplete(): boolean {
    return ATTR_KEYS.every(k => this.assignments()[k] !== undefined);
  }

  getRollAttributes(): Attributes | null {
    if (!this.rollAssignmentComplete) return null;
    const a = this.assignments() as Record<AttributeKey, number>;
    return { STR: a.STR, CON: a.CON, AGL: a.AGL, INT: a.INT, WIL: a.WIL, CHA: a.CHA };
  }

  getModifiedRoll(attr: AttributeKey): number | null {
    const base = this.assignments()[attr];
    if (base === undefined) return null;
    const age = this.age;
    if (!age) return base;
    const attrs = this.getRollAttributes();
    if (!attrs) return base;
    return applyAgeModifiers(attrs, age)[attr];
  }

  // --- Standard array ---

  get standardAvailableScores(): number[] {
    const remaining = [...Object.values(this.assignments())];
    return [...STANDARD_ARRAY].filter(s => {
      const idx = remaining.indexOf(s);
      if (idx !== -1) { remaining.splice(idx, 1); return false; }
      return true;
    });
  }

  assignStandardScore(attr: AttributeKey, score: number): void {
    this.assignments.set({ ...this.assignments(), [attr]: score });
  }

  getStandardModified(attr: AttributeKey): number | null {
    const base = this.assignments()[attr];
    if (base === undefined) return null;
    const age = this.age;
    if (!age) return base;
    const attrs = this.getRollAttributes();
    if (!attrs) return base;
    return applyAgeModifiers(attrs, age)[attr];
  }

  // --- Point buy ---

  get pointBuySpent(): number {
    return ATTR_KEYS.reduce((sum, k) => sum + pointBuyCost(this.pointBuyValues()[k]), 0);
  }

  get pointBuyRemaining(): number {
    return POINT_BUY_BUDGET - this.pointBuySpent;
  }

  effectivePointBuyMax(attr: AttributeKey): number {
    const age = this.age;
    if (age === 'Young' && (attr === 'AGL' || attr === 'CON')) return POINT_BUY_MAX - 1;
    if (age === 'Old' && (attr === 'INT' || attr === 'WIL')) return POINT_BUY_MAX - 1;
    return POINT_BUY_MAX;
  }

  adjustPointBuy(attr: AttributeKey, delta: number): void {
    const current = this.pointBuyValues()[attr];
    const next = current + delta;
    if (next < POINT_BUY_MIN || next > this.effectivePointBuyMax(attr)) return;
    const cost = pointBuyCostDelta(current, next);
    if (cost > this.pointBuyRemaining) return;
    this.pointBuyValues.update(v => ({ ...v, [attr]: next }));
  }

  getPointBuyModified(attr: AttributeKey): number {
    const base = this.pointBuyValues()[attr];
    const age = this.age;
    if (!age) return base;
    return applyAgeModifiers(this.pointBuyValues() as Attributes, age)[attr];
  }

  getPointBuyCost(attr: AttributeKey): number {
    return pointBuyCost(this.pointBuyValues()[attr]);
  }

  get pointBuyComplete(): boolean {
    return true; // Always valid since defaults are set
  }

  // --- Shared ---

  get canContinue(): boolean {
    if (this.mode() === 'pointbuy') return this.pointBuyComplete;
    return this.rollAssignmentComplete;
  }

  continue(): void {
    let attrs: Attributes;
    if (this.mode() === 'pointbuy') {
      attrs = { ...this.pointBuyValues() } as Attributes;
    } else {
      attrs = this.getRollAttributes()!;
    }
    this.draftService.setAttributes(attrs, this.mode());
    this.router.navigate(['/create/derived']);
  }
}
