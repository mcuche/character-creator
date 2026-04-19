import { Component, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CharacterDraftService } from '../../../../services/character-draft.service';
import { PROFESSION_DATA } from '../../../../data/professions.data';
import { SKILLS_DATA } from '../../../../data/skills.data';
import { getTrainedSkillCount } from '../../../../services/character-rules.service';
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

  selectedProfSkills = signal<Set<string>>(new Set());
  selectedFreeSkills = signal<Set<string>>(new Set());

  constructor() {
    const draft = this.draft();
    const trainedNames = Object.entries(draft.skills ?? {})
      .filter(([, e]) => e.trained)
      .map(([name]) => name);
    const profSkills = this.professionSkills;
    this.selectedProfSkills.set(new Set(trainedNames.filter(n => profSkills.includes(n))));
    this.selectedFreeSkills.set(new Set(trainedNames.filter(n => !profSkills.includes(n))));
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

  get profSkillSlots(): number {
    return 6;
  }

  get freeSkillSlots(): number {
    return this.totalSkills - this.profSkillSlots;
  }

  get professionSkills(): string[] {
    const prof = PROFESSION_DATA.find(p => p.name === this.profession);
    if (!prof) return [];
    // For Mage, include the magic school as a profession skill
    const skills = [...prof.skills];
    const draft = this.draft();
    if (this.profession === 'Mage' && draft.magicSchool) {
      skills.unshift(draft.magicSchool);
    }
    return skills;
  }

  get freeSkillOptions(): string[] {
    return this.allSkills.map(s => s.name).filter(n => !this.selectedProfSkills().has(n));
  }

  getSkillLevel(name: string): number {
    return this.draft().skills?.[name]?.level ?? 0;
  }

  getSkillAttr(name: string): string {
    return SKILLS_DATA.find(s => s.name === name)?.attribute ?? '';
  }

  toggleProfSkill(name: string): void {
    const set = new Set(this.selectedProfSkills());
    if (set.has(name)) {
      set.delete(name);
    } else if (set.size < this.profSkillSlots) {
      set.add(name);
    }
    this.selectedProfSkills.set(set);
  }

  toggleFreeSkill(name: string): void {
    const set = new Set(this.selectedFreeSkills());
    if (set.has(name)) {
      set.delete(name);
    } else if (set.size < this.freeSkillSlots) {
      set.add(name);
    }
    this.selectedFreeSkills.set(set);
  }

  get canContinue(): boolean {
    return this.selectedProfSkills().size === this.profSkillSlots &&
      this.selectedFreeSkills().size === this.freeSkillSlots;
  }

  continue(): void {
    const trained = [...this.selectedProfSkills(), ...this.selectedFreeSkills()];
    this.draftService.setTrainedSkills(trained);
    this.router.navigate(['/create/weakness']);
  }
}
