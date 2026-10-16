import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Character } from '../../../../models/character.models';

type Coin = 'gold' | 'silver' | 'copper';

@Component({
  selector: 'app-sheet-gear',
  imports: [FormsModule],
  templateUrl: './sheet-gear.component.html',
})
export class SheetGearComponent {
  readonly Math = Math;
  readonly character = input.required<Character>();
  readonly patch = output<Partial<Character>>();

  setCurrency(type: Coin, value: number): void {
    if (!Number.isFinite(value)) return;
    this.patch.emit({ [type]: Math.max(0, Math.floor(value)) });
  }

  updateCurrency(type: Coin, delta: number): void {
    this.setCurrency(type, (this.character()[type] ?? 0) + delta);
  }
}
