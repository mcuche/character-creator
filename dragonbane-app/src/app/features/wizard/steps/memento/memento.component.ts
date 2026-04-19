import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CharacterDraftService } from '../../../../services/character-draft.service';
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
  expanded = signal(false);
  name = signal('');
  significance = signal('');

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
    } else {
      this.expanded.set(true);
    }
  }

  continue(): void {
    const hasMemento = this.expanded() && this.name().trim();
    this.draftService.setMemento(hasMemento ? { name: this.name(), significance: this.significance() } : undefined);
    this.router.navigate(['/create/appearance']);
  }
}
