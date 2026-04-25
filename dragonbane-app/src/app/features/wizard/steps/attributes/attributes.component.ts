import { Component, inject, signal } from '@angular/core';
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
  showContinueWarning = signal(false);
  pendingAttrs = signal<Attributes | null>(null);

  // Roll mode — independent state
  rolledScores = signal<DiceRoll[]>([]);
  rollAssignments = signal<Partial<Record<AttributeKey, number>>>({});
  swapState = signal<AttributeKey[]>([]);

  // Standard array — independent state
  standardAssignments = signal<Partial<Record<AttributeKey, number>>>({});

  // Point buy — independent state
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
        this.standardAssignments.set({ ...draft.attributes });
      } else {
        this.mode.set('roll');
        this.rollAssignments.set({ ...draft.attributes });
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
    this.mode.set(m);
  }

  confirmContinue(): void {
    const attrs = this.pendingAttrs();
    if (attrs) this.saveAndNavigate(attrs);
    this.showContinueWarning.set(false);
    this.pendingAttrs.set(null);
  }

  cancelContinue(): void {
    this.showContinueWarning.set(false);
    this.pendingAttrs.set(null);
  }

  // --- Roll mode ---

  rollAll(): void {
    this.rolledScores.set(ATTR_KEYS.map(() => roll4d6DropLowestDetailed()));
    this.rollAssignments.set({});
    this.swapState.set([]);
  }

  assignScore(attr: AttributeKey, roll: DiceRoll): void {
    this.rollAssignments.set({ ...this.rollAssignments(), [attr]: roll.total });
  }

  unassign(attr: AttributeKey): void {
    if (this.mode() === 'roll') {
      const a = { ...this.rollAssignments() };
      delete a[attr];
      this.rollAssignments.set(a);
      this.swapState.set([]);
    } else {
      const a = { ...this.standardAssignments() };
      delete a[attr];
      this.standardAssignments.set(a);
    }
  }

  get availableScores(): DiceRoll[] {
    const remaining = [...Object.values(this.rollAssignments())];
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
        const a = { ...this.rollAssignments() };
        const [k1, k2] = newSwap;
        [a[k1], a[k2]] = [a[k2]!, a[k1]!];
        this.rollAssignments.set(a);
        this.swapState.set([]);
      }
    }
  }

  get rollComplete(): boolean {
    return ATTR_KEYS.every(k => this.rollAssignments()[k] !== undefined);
  }

  getRollAttributes(): Attributes | null {
    if (!this.rollComplete) return null;
    const a = this.rollAssignments() as Record<AttributeKey, number>;
    return { STR: a.STR, CON: a.CON, AGL: a.AGL, INT: a.INT, WIL: a.WIL, CHA: a.CHA };
  }

  getModifiedRoll(attr: AttributeKey): number | null {
    const base = this.rollAssignments()[attr];
    if (base === undefined) return null;
    const age = this.age;
    if (!age) return base;
    const attrs = this.getRollAttributes();
    if (!attrs) return base;
    return applyAgeModifiers(attrs, age)[attr];
  }

  // --- Standard array ---

  get standardAvailableScores(): number[] {
    const remaining = [...Object.values(this.standardAssignments())];
    return [...STANDARD_ARRAY].filter(s => {
      const idx = remaining.indexOf(s);
      if (idx !== -1) { remaining.splice(idx, 1); return false; }
      return true;
    });
  }

  assignStandardScore(attr: AttributeKey, score: number): void {
    this.standardAssignments.set({ ...this.standardAssignments(), [attr]: score });
  }

  get standardComplete(): boolean {
    return ATTR_KEYS.every(k => this.standardAssignments()[k] !== undefined);
  }

  getStandardModified(attr: AttributeKey): number | null {
    const base = this.standardAssignments()[attr];
    if (base === undefined) return null;
    const age = this.age;
    if (!age) return base;
    if (!this.standardComplete) return base;
    const a = this.standardAssignments() as Record<AttributeKey, number>;
    return applyAgeModifiers(a as Attributes, age)[attr];
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

  // --- Shared ---

  get canContinue(): boolean {
    if (this.mode() === 'pointbuy') return true;
    if (this.mode() === 'roll') return this.rollComplete;
    return this.standardComplete;
  }

  private getCurrentAttrs(): Attributes | null {
    if (this.mode() === 'pointbuy') {
      return { ...this.pointBuyValues() } as Attributes;
    }
    if (this.mode() === 'roll') return this.getRollAttributes();
    if (!this.standardComplete) return null;
    const a = this.standardAssignments() as Record<AttributeKey, number>;
    return { STR: a.STR, CON: a.CON, AGL: a.AGL, INT: a.INT, WIL: a.WIL, CHA: a.CHA };
  }

  private attrsChanged(newAttrs: Attributes): boolean {
    const saved = this.draft().attributes;
    if (!saved) return false;
    if (this.draft().attributeGenerationMethod !== this.mode()) return true;
    return ATTR_KEYS.some(k => newAttrs[k] !== saved[k]);
  }

  continue(): void {
    const attrs = this.getCurrentAttrs();
    if (!attrs) return;
    if (this.hasDownstreamData && this.attrsChanged(attrs)) {
      this.pendingAttrs.set(attrs);
      this.showContinueWarning.set(true);
    } else {
      this.saveAndNavigate(attrs);
    }
  }

  private saveAndNavigate(attrs: Attributes): void {
    this.draftService.setAttributes(attrs, this.mode());
    this.router.navigate(['/create/derived']);
  }
}
