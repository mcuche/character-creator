import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Character, Condition } from '../../../../models/character.models';

const CONDITIONS: Condition[] = ['Exhausted', 'Sickly', 'Dazed', 'Angry', 'Scared', 'Disheartened'];
const CONDITION_ATTRS: Record<Condition, string> = {
  Exhausted: 'STR', Sickly: 'CON', Dazed: 'AGL', Angry: 'INT', Scared: 'WIL', Disheartened: 'CHA',
};

@Component({
  selector: 'app-sheet-vitals',
  imports: [FormsModule],
  templateUrl: './sheet-vitals.component.html',
})
export class SheetVitalsComponent {
  readonly character = input.required<Character>();
  readonly patch = output<Partial<Character>>();

  readonly conditions = CONDITIONS;
  readonly conditionAttrs = CONDITION_ATTRS;

  updateName(name: string): void {
    this.patch.emit({ name });
  }

  updateCurrentHP(delta: number): void {
    const char = this.character();
    const max = char.derivedStats?.hp ?? 0;
    this.patch.emit({ currentHP: Math.max(0, Math.min(max, char.currentHP + delta)) });
  }

  updateCurrentWP(delta: number): void {
    const char = this.character();
    const max = char.derivedStats?.wp ?? 0;
    this.patch.emit({ currentWP: Math.max(0, Math.min(max, char.currentWP + delta)) });
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
