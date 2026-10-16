import { Component, computed, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Character, Condition } from '../../../../models/character.models';
import { IconComponent } from '../../../../shared/icon/icon.component';

const CONDITIONS: Condition[] = ['Exhausted', 'Sickly', 'Dazed', 'Angry', 'Scared', 'Disheartened'];
const CONDITION_ATTRS: Record<Condition, string> = {
  Exhausted: 'STR', Sickly: 'CON', Dazed: 'AGL', Angry: 'INT', Scared: 'WIL', Disheartened: 'CHA',
};

@Component({
  selector: 'app-sheet-vitals',
  imports: [FormsModule, IconComponent],
  templateUrl: './sheet-vitals.component.html',
})
export class SheetVitalsComponent {
  readonly character = input.required<Character>();
  readonly patch = output<Partial<Character>>();

  readonly conditions = CONDITIONS;
  readonly conditionAttrs = CONDITION_ATTRS;

  readonly maxHP = computed(() => this.character().derivedStats?.hp ?? 0);
  readonly maxWP = computed(() => this.character().derivedStats?.wp ?? 0);

  /** "Elf · Mage · Adult", skipping anything not yet chosen. */
  readonly identity = computed(() => {
    const c = this.character();
    return [c.kin, c.profession, c.age].filter(Boolean).join(' · ');
  });

  updateName(name: string): void {
    this.patch.emit({ name });
  }

  updateCurrentHP(delta: number): void {
    const char = this.character();
    this.patch.emit({ currentHP: Math.max(0, Math.min(this.maxHP(), char.currentHP + delta)) });
  }

  updateCurrentWP(delta: number): void {
    const char = this.character();
    this.patch.emit({ currentWP: Math.max(0, Math.min(this.maxWP(), char.currentWP + delta)) });
  }

  toggleCondition(condition: Condition): void {
    const current = this.character().conditions;
    const next = current.includes(condition) ? current.filter(c => c !== condition) : [...current, condition];
    this.patch.emit({ conditions: next });
  }

  hasCondition(condition: Condition): boolean {
    return this.character().conditions.includes(condition);
  }
}
