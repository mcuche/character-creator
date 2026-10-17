import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CharacterDraftService } from '../../../../services/character-draft.service';
import { PROFESSION_DATA } from '../../../../data/professions.data';
import { inferGearType } from '../../../../data/gear.data';
import { GearItem } from '../../../../models/character.models';
import { StepNavComponent } from '../../../../shared/step-nav/step-nav.component';

@Component({
  selector: 'app-gear',
  imports: [CommonModule, FormsModule, StepNavComponent],
  templateUrl: './gear.component.html',
})
export class GearComponent {
  private draftService = inject(CharacterDraftService);
  private router = inject(Router);

  readonly draft = this.draftService.draft;
  gear = signal<GearItem[]>([]);
  newItemName = signal('');

  constructor() {
    const draft = this.draft();
    if (draft.gear && draft.gear.length > 0) {
      this.gear.set([...draft.gear]);
    } else {
      // Load suggested gear from profession
      const prof = PROFESSION_DATA.find(p => p.name === draft.profession);
      if (prof) {
        this.gear.set(prof.suggestedGear.map((seed, i) => ({
          id: `suggested-${i}`,
          name: seed.name,
          type: seed.type,
          quantity: 1,
          weight: 1,
        })));
      }
    }
  }

  addItem(): void {
    const name = this.newItemName().trim();
    if (!name) return;
    this.gear.update(g => [...g, {
      id: crypto.randomUUID(),
      name,
      type: inferGearType(name),
      quantity: 1,
      weight: 1,
    }]);
    this.newItemName.set('');
  }

  removeItem(id: string): void {
    this.gear.update(g => g.filter(i => i.id !== id));
  }

  updateQuantity(id: string, delta: number): void {
    this.gear.update(g => g.map(i =>
      i.id === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i
    ));
  }

  continue(): void {
    this.draftService.setGear(this.gear());
    this.router.navigate(['/create/memento']);
  }
}
