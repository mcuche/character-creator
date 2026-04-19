import { Component, inject } from '@angular/core';
// Expose Math for template
const Math = globalThis.Math;
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CharacterDraftService } from '../../../../services/character-draft.service';
import { StepNavComponent } from '../../../../shared/step-nav/step-nav.component';
import { getBaseChance } from '../../../../services/character-rules.service';
import { AttributeKey } from '../../../../models/character.models';
import { SKILLS_DATA } from '../../../../data/skills.data';
import { applyAgeModifiers } from '../../../../services/character-rules.service';

@Component({
  selector: 'app-derived',
  imports: [CommonModule, StepNavComponent],
  templateUrl: './derived.component.html',
})
export class DerivedComponent {
  readonly Math = Math;
  private draftService = inject(CharacterDraftService);
  private router = inject(Router);

  readonly draft = this.draftService.draft;

  get modifiedAttributes() {
    const d = this.draft();
    if (!d.attributes) return null;
    return d.age ? applyAgeModifiers(d.attributes, d.age) : d.attributes;
  }

  get derivedStats() {
    return this.draft().derivedStats;
  }

  getBaseChanceDisplay(attr: AttributeKey): { score: number; base: number } | null {
    const attrs = this.modifiedAttributes;
    if (!attrs) return null;
    const score = attrs[attr];
    return { score, base: getBaseChance(score) };
  }

  get attrKeys(): AttributeKey[] {
    return ['STR', 'CON', 'AGL', 'INT', 'WIL', 'CHA'];
  }

  continue(): void {
    this.router.navigate(['/create/skills']);
  }
}
