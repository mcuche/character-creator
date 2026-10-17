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
  expanded = signal(false);
  weaknessText = signal('');
  rolledIndex = signal<number | null>(null);

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
      this.rolledIndex.set(null);
    } else {
      this.expanded.set(true);
    }
  }

  rollRandom(): void {
    const i = Math.floor(Math.random() * WEAKNESS_EXAMPLES.length);
    this.expanded.set(true);
    this.rolledIndex.set(i);
    this.weaknessText.set(WEAKNESS_EXAMPLES[i].name);
  }

  select(name: string): void {
    this.rolledIndex.set(null);
    this.weaknessText.set(name);
  }

  continue(): void {
    this.draftService.setWeakness(this.expanded() && this.weaknessText() ? this.weaknessText() : undefined);
    this.router.navigate(['/create/gear']);
  }
}
