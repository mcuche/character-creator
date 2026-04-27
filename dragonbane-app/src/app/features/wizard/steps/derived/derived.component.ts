import { Component, inject } from '@angular/core';
// Expose Math for template
const Math = globalThis.Math;
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CharacterDraftService } from '../../../../services/character-draft.service';
import { StepNavComponent } from '../../../../shared/step-nav/step-nav.component';
import { getBaseChance, getMovementModifier, applyAgeModifiers } from '../../../../services/character-rules.service';
import { AttributeKey } from '../../../../models/character.models';
import { KIN_DATA } from '../../../../data/kin.data';

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

  get movementBreakdown(): { kinBase: number; aglMod: number; aglLabel: string } | null {
    const d = this.draft();
    const attrs = this.modifiedAttributes;
    if (!attrs || !d.kin) return null;
    const kinData = KIN_DATA.find(k => k.name === d.kin);
    if (!kinData) return null;
    const agl = attrs.AGL;
    const aglMod = getMovementModifier(agl);
    const aglLabel = agl <= 6 ? 'AGL ≤ 6'
      : agl <= 9  ? 'AGL 7–9'
      : agl <= 12 ? 'AGL 10–12'
      : agl <= 15 ? 'AGL 13–15'
      : 'AGL ≥ 16';
    return { kinBase: kinData.move, aglMod, aglLabel };
  }

  getDamageBonusLabel(score: number): string {
    if (score <= 12) return '≤ 12';
    if (score <= 16) return '13–16';
    return '≥ 17';
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

  readonly attrFullNames: Record<AttributeKey, string> = {
    STR: 'Strength',
    CON: 'Constitution',
    AGL: 'Agility',
    INT: 'Intelligence',
    WIL: 'Willpower',
    CHA: 'Charisma',
  };

  continue(): void {
    this.router.navigate(['/create/skills']);
  }
}
