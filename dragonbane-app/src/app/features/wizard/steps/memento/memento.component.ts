import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CharacterDraftService } from '../../../../services/character-draft.service';
import { MEMENTO_EXAMPLES } from '../../../../data/mementos.data';
import { Memento } from '../../../../models/character.models';
import { StepNavComponent } from '../../../../shared/step-nav/step-nav.component';

@Component({
  selector: 'app-memento',
  imports: [CommonModule, FormsModule, StepNavComponent],
  templateUrl: './memento.component.html',
})
export class MementoComponent {
  private draftService = inject(CharacterDraftService);
  private router = inject(Router);

  readonly draft = this.draftService.draft;
  readonly examples = MEMENTO_EXAMPLES;
  name = signal(this.draft().memento?.name ?? '');
  significance = signal(this.draft().memento?.significance ?? '');
  rolledIndex = signal<number | null>(null);

  rollRandom(): void {
    const i = Math.floor(Math.random() * MEMENTO_EXAMPLES.length);
    this.rolledIndex.set(i);
    this.fill(MEMENTO_EXAMPLES[i]);
  }

  editName(text: string): void {
    this.rolledIndex.set(null);
    this.name.set(text);
  }

  editSignificance(text: string): void {
    this.rolledIndex.set(null);
    this.significance.set(text);
  }

  /** Clicking the selected example again clears it. */
  select(m: Memento): void {
    if (this.name() === m.name) {
      this.clear();
      return;
    }
    this.rolledIndex.set(null);
    this.fill(m);
  }

  clear(): void {
    this.rolledIndex.set(null);
    this.fill({ name: '', significance: '' });
  }

  private fill(m: Memento): void {
    this.name.set(m.name);
    this.significance.set(m.significance);
  }

  continue(): void {
    const name = this.name().trim();
    this.draftService.setMemento(name ? { name, significance: this.significance().trim() } : undefined);
    this.router.navigate(['/create/appearance']);
  }
}
