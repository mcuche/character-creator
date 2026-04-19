import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CharacterDraftService } from '../../../../services/character-draft.service';
import { Age } from '../../../../models/character.models';
import { StepNavComponent } from '../../../../shared/step-nav/step-nav.component';
import { ConfirmModalComponent } from '../../../../shared/confirm-modal/confirm-modal.component';

const AGE_OPTIONS: { name: Age; diceRange: string; skills: number; modifier: string }[] = [
  { name: 'Young', diceRange: '1–3', skills: 8, modifier: 'AGL +1, CON +1' },
  { name: 'Adult', diceRange: '4–5', skills: 10, modifier: 'No modifiers' },
  { name: 'Old', diceRange: '6', skills: 12, modifier: 'STR −2, AGL −2, CON −2, INT +1, WIL +1' },
];

@Component({
  selector: 'app-age',
  imports: [CommonModule, StepNavComponent, ConfirmModalComponent],
  templateUrl: './age.component.html',
})
export class AgeComponent {
  private draftService = inject(CharacterDraftService);
  private router = inject(Router);

  readonly draft = this.draftService.draft;
  readonly ageOptions = AGE_OPTIONS;
  rolledIndex = signal<number | null>(null);
  pendingAge = signal<Age | null>(null);

  get selected(): Age | undefined {
    return this.draft().age;
  }

  get backPath(): string {
    return this.draft().profession === 'Mage' ? 'mage-school' : 'profession';
  }

  get hasDownstreamData(): boolean {
    return !!this.draft().attributes;
  }

  rollRandom(): void {
    const roll = Math.floor(Math.random() * 6) + 1;
    let age: Age;
    let idx: number;
    if (roll <= 3) { age = 'Young'; idx = 0; }
    else if (roll <= 5) { age = 'Adult'; idx = 1; }
    else { age = 'Old'; idx = 2; }
    this.rolledIndex.set(idx);
    this.trySelect(age);
  }

  select(age: Age): void {
    this.rolledIndex.set(null);
    this.trySelect(age);
  }

  trySelect(age: Age): void {
    if (age === this.selected) return;
    if (this.hasDownstreamData) {
      this.pendingAge.set(age);
    } else {
      this.draftService.setAge(age);
    }
  }

  confirmChange(): void {
    const a = this.pendingAge();
    if (a) this.draftService.setAge(a);
    this.pendingAge.set(null);
  }

  cancelChange(): void {
    this.rolledIndex.set(null);
    this.pendingAge.set(null);
  }

  continue(): void {
    this.router.navigate(['/create/attributes']);
  }
}
