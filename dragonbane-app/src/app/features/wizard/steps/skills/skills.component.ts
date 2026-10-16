import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CharacterDraftService } from '../../../../services/character-draft.service';
import { PROFESSION_DATA } from '../../../../data/professions.data';
import { SKILLS_DATA } from '../../../../data/skills.data';
import { applyAgeModifiers, getSkillLevel, getTrainedSkillCount } from '../../../../services/character-rules.service';
import { AttributeKey } from '../../../../models/character.models';
import { StepNavComponent } from '../../../../shared/step-nav/step-nav.component';

@Component({
  selector: 'app-skills',
  imports: [CommonModule, StepNavComponent],
  templateUrl: './skills.component.html',
})
export class SkillsComponent {
  private draftService = inject(CharacterDraftService);
  private router = inject(Router);

  readonly draft = this.draftService.draft;
  readonly allSkills = SKILLS_DATA;

  selectedFreeSkills = signal<Set<string>>(new Set());

  constructor() {
    const draft = this.draft();
    const trainedNames = Object.entries(draft.skills ?? {})
      .filter(([, e]) => e.trained)
      .map(([name]) => name);
    const profSkills = new Set(this.professionSkills);
    this.selectedFreeSkills.set(new Set(trainedNames.filter(n => !profSkills.has(n))));
  }

  get profession() {
    return this.draft().profession;
  }

  get age() {
    return this.draft().age;
  }

  get totalSkills(): number {
    return this.age ? getTrainedSkillCount(this.age) : 10;
  }

  get freeSkillSlots(): number {
    return this.totalSkills - 6;
  }

  get professionSkills(): string[] {
    const prof = PROFESSION_DATA.find(p => p.name === this.profession);
    return prof ? [...prof.skills] : [];
  }

  get magicSchool(): string | null {
    if (this.profession !== 'Mage') return null;
    return this.draft().magicSchool ?? null;
  }

  get freeSkillOptions(): string[] {
    const profSet = new Set(this.professionSkills);
    return this.allSkills.map(s => s.name).filter(n => !profSet.has(n));
  }

  isProfSkill(name: string): boolean {
    return new Set(this.professionSkills).has(name);
  }

  // Level the skill has once trained — every row on this step is a trained skill
  getTrainedLevel(name: string): number {
    const { attributes, age } = this.draft();
    if (!attributes) return 0;
    const modified = age ? applyAgeModifiers(attributes, age) : attributes;
    const attr = (name === this.magicSchool ? 'WIL' : this.getSkillAttr(name)) as AttributeKey;
    return getSkillLevel(modified[attr], true);
  }

  getSkillAttr(name: string): string {
    return SKILLS_DATA.find(s => s.name === name)?.attribute ?? '';
  }

  toggleFreeSkill(name: string): void {
    if (this.isProfSkill(name)) return;
    const set = new Set(this.selectedFreeSkills());
    if (set.has(name)) {
      set.delete(name);
    } else if (set.size < this.freeSkillSlots) {
      set.add(name);
    }
    this.selectedFreeSkills.set(set);
  }

  get canContinue(): boolean {
    return this.selectedFreeSkills().size === this.freeSkillSlots;
  }

  continue(): void {
    const allTrained = [...this.professionSkills, ...this.selectedFreeSkills()];
    this.draftService.setTrainedSkills(allTrained);
    this.router.navigate(['/create/weakness']);
  }
}
