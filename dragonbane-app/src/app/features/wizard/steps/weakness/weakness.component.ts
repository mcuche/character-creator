import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CharacterDraftService } from '../../../../services/character-draft.service';
import { StepNavComponent } from '../../../../shared/step-nav/step-nav.component';

const SUGGESTED_WEAKNESSES = [
  'Greedy', 'Cowardly', 'Reckless', 'Vengeful', 'Arrogant',
  'Impulsive', 'Paranoid', 'Gullible', 'Stubborn', 'Vain',
  'Wrathful', 'Envious',
];

@Component({
  selector: 'app-weakness',
  imports: [CommonModule, FormsModule, StepNavComponent],
  templateUrl: './weakness.component.html',
})
export class WeaknessComponent {
  private draftService = inject(CharacterDraftService);
  private router = inject(Router);

  readonly draft = this.draftService.draft;
  readonly suggestions = SUGGESTED_WEAKNESSES;
  expanded = signal(false);
  weaknessText = signal('');

  constructor() {
    const w = this.draft().weakness;
    if (w) {
      this.expanded.set(true);
      this.weaknessText.set(w);
    }
  }

  toggle(): void {
    if (this.expanded()) {
      this.expanded.set(false);
      this.weaknessText.set('');
    } else {
      this.expanded.set(true);
    }
  }

  selectSuggestion(w: string): void {
    this.weaknessText.set(w);
  }

  continue(): void {
    this.draftService.setWeakness(this.expanded() && this.weaknessText() ? this.weaknessText() : undefined);
    this.router.navigate(['/create/gear']);
  }
}
