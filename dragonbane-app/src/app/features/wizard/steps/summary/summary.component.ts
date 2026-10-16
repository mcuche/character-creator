import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CharacterDraftService } from '../../../../services/character-draft.service';
import { CharacterService } from '../../../../services/character.service';
import { StepNavComponent } from '../../../../shared/step-nav/step-nav.component';
import { applyAgeModifiers } from '../../../../services/character-rules.service';
import { AttributeKey, Attributes } from '../../../../models/character.models';
import { KIN_DATA } from '../../../../data/kin.data';

const ATTR_KEYS: AttributeKey[] = ['STR', 'CON', 'AGL', 'INT', 'WIL', 'CHA'];
const ATTR_LABELS: Record<AttributeKey, string> = {
  STR: 'Strength', CON: 'Constitution', AGL: 'Agility',
  INT: 'Intelligence', WIL: 'Willpower', CHA: 'Charisma',
};
const APPEARANCE_LABELS: { key: 'height' | 'build' | 'hair' | 'eyes' | 'skin' | 'distinguishingFeatures'; label: string }[] = [
  { key: 'height', label: 'Height' },
  { key: 'build', label: 'Build' },
  { key: 'hair', label: 'Hair' },
  { key: 'eyes', label: 'Eyes' },
  { key: 'skin', label: 'Skin' },
  { key: 'distinguishingFeatures', label: 'Features' },
];

@Component({
  selector: 'app-summary',
  imports: [CommonModule, RouterLink, StepNavComponent],
  templateUrl: './summary.component.html',
})
export class SummaryComponent {
  private draftService = inject(CharacterDraftService);
  private characterService = inject(CharacterService);
  private router = inject(Router);

  readonly draft = this.draftService.draft;
  readonly attrKeys = ATTR_KEYS;
  readonly attrLabels = ATTR_LABELS;

  // ── Presentation helpers ──

  /** Final attribute scores (age modifiers applied), as shown on the derived step. */
  get finalAttributes(): Attributes | null {
    const d = this.draft();
    if (!d.attributes) return null;
    return d.age ? applyAgeModifiers(d.attributes, d.age) : d.attributes;
  }

  /** Innate ability name(s) for the chosen kin. */
  get innateAbilityLabel(): string | null {
    const kin = KIN_DATA.find(k => k.name === this.draft().kin);
    if (!kin) return null;
    return kin.innateAbilities?.length
      ? kin.innateAbilities.map(a => a.name).join(', ')
      : kin.innateAbilityName;
  }

  /** Filled-in appearance fields only. */
  get appearanceRows(): { label: string; value: string }[] {
    const a = this.draft().appearance ?? {};
    return APPEARANCE_LABELS
      .filter(f => !!a[f.key])
      .map(f => ({ label: f.label, value: a[f.key] as string }));
  }

  get trainedSkills() {
    return Object.values(this.draft().skills ?? {}).filter(s => s.trained);
  }

  get untrainedSkills() {
    return Object.values(this.draft().skills ?? {}).filter(s => !s.trained);
  }

  saveAndOpen(): void {
    const character = this.draftService.toCharacter();
    this.characterService.add(character);
    this.draftService.reset();
    this.router.navigate(['/character', character.id]);
  }

  exportJson(): void {
    const character = this.draftService.toCharacter();
    const blob = new Blob([JSON.stringify(character, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${character.name || 'character'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
