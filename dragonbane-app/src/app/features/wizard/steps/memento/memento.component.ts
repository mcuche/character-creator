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
  expanded = signal(false);
  name = signal('');
  significance = signal('');
  rolledIndex = signal<number | null>(null);

  constructor() {
    const m = this.draft().memento;
    if (m) {
      this.expanded.set(true);
      this.name.set(m.name);
      this.significance.set(m.significance);
    }
  }

  toggle(): void {
    if (this.expanded()) {
      this.expanded.set(false);
      this.name.set('');
      this.significance.set('');
      this.rolledIndex.set(null);
    } else {
      this.expanded.set(true);
    }
  }

  rollRandom(): void {
    const i = Math.floor(Math.random() * MEMENTO_EXAMPLES.length);
    this.expanded.set(true);
    this.rolledIndex.set(i);
    this.fill(MEMENTO_EXAMPLES[i]);
  }

  select(m: Memento): void {
    this.rolledIndex.set(null);
    this.fill(m);
  }

  private fill(m: Memento): void {
    this.name.set(m.name);
    this.significance.set(m.significance);
  }

  continue(): void {
    const hasMemento = this.expanded() && this.name().trim();
    this.draftService.setMemento(hasMemento ? { name: this.name(), significance: this.significance() } : undefined);
    this.router.navigate(['/create/appearance']);
  }
}
