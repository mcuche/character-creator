import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CharacterDraftService } from '../../../../services/character-draft.service';
import { applyAgeModifiers, computeEncumbrance } from '../../../../services/character-rules.service';
import { PROFESSION_DATA } from '../../../../data/professions.data';
import { GearSeed, autoEquip } from '../../../../data/gear.data';
import { GearItem } from '../../../../models/character.models';
import { StepNavComponent } from '../../../../shared/step-nav/step-nav.component';
import { GearListComponent } from '../../../../shared/gear-list/gear-list.component';

/** Turn a starting-kit seed into a pack row, rolling any D6 quantity. */
function fromSeed(seed: GearSeed, i: number): GearItem {
  const rolled = seed.quantity === 'D6';
  const item: GearItem = {
    id: `suggested-${i}`,
    name: seed.name,
    type: seed.type,
    quantity: seed.quantity === 'D6' ? Math.floor(Math.random() * 6) + 1 : (seed.quantity ?? 1),
    weight: seed.weight ?? 1,
  };
  if (rolled) item.notes = 'rolled D6';
  return item;
}

@Component({
  selector: 'app-gear',
  imports: [StepNavComponent, GearListComponent],
  templateUrl: './gear.component.html',
})
export class GearComponent {
  private draftService = inject(CharacterDraftService);
  private router = inject(Router);

  readonly draft = this.draftService.draft;
  gear = signal<GearItem[]>([]);

  /** Age-adjusted STR, or null while attributes are unset. */
  readonly str = computed(() => {
    const { attributes, age } = this.draft();
    if (!attributes) return null;
    return (age ? applyAgeModifiers(attributes, age) : attributes).STR;
  });

  readonly encumbrance = computed(() => {
    const d = this.draft();
    return computeEncumbrance(this.gear(), this.str(), (d.gold ?? 0) + (d.silver ?? 0) + (d.copper ?? 0));
  });

  constructor() {
    const draft = this.draft();
    if (draft.gear && draft.gear.length > 0) {
      this.gear.set([...draft.gear]);
    } else {
      // Pre-fill the profession's kit, worn and at hand
      const prof = PROFESSION_DATA.find(p => p.name === draft.profession);
      if (prof) this.gear.set(autoEquip(prof.suggestedGear.map(fromSeed)));
    }
  }

  continue(): void {
    this.draftService.setGear(this.gear());
    this.router.navigate(['/create/memento']);
  }
}
