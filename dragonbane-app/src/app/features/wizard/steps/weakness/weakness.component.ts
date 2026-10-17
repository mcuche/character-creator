import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CharacterDraftService } from '../../../../services/character-draft.service';
import { WEAKNESS_EXAMPLES } from '../../../../data/weaknesses.data';
import { StepNavComponent } from '../../../../shared/step-nav/step-nav.component';

@Component({
  selector: 'app-weakness',
  imports: [CommonModule, FormsModule, StepNavComponent],
  templateUrl: './weakness.component.html',
})
export class WeaknessComponent {
  private draftService = inject(CharacterDraftService);
  private router = inject(Router);

  readonly draft = this.draftService.draft;
  readonly examples = WEAKNESS_EXAMPLES;
  weaknessText = signal(this.draft().weakness ?? '');
  rolledIndex = signal<number | null>(null);

  rollRandom(): void {
    const i = Math.floor(Math.random() * WEAKNESS_EXAMPLES.length);
    this.rolledIndex.set(i);
    this.weaknessText.set(WEAKNESS_EXAMPLES[i].name);
  }

  edit(text: string): void {
    this.rolledIndex.set(null);
    this.weaknessText.set(text);
  }

  /** Clicking the selected example again clears it. */
  select(name: string): void {
    this.rolledIndex.set(null);
    this.weaknessText.set(this.weaknessText() === name ? '' : name);
  }

  continue(): void {
    this.draftService.setWeakness(this.weaknessText().trim() || undefined);
    this.router.navigate(['/create/gear']);
  }
}
