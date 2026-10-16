import { Component, computed, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Character, SkillEntry } from '../../../../models/character.models';
import { SKILLS_DATA } from '../../../../data/skills.data';

@Component({
  selector: 'app-sheet-skills',
  imports: [FormsModule],
  templateUrl: './sheet-skills.component.html',
})
export class SheetSkillsComponent {
  readonly character = input.required<Character>();
  readonly patch = output<Partial<Character>>();

  /** Trained skills, magic school first. */
  readonly trainedSkills = computed<SkillEntry[]>(() => {
    const { skills, magicSchool } = this.character();
    const names = [...(magicSchool ? [magicSchool] : []), ...SKILLS_DATA.map(s => s.name)];
    return names.map(n => skills[n]).filter(Boolean).filter(s => s.trained);
  });

  readonly untrainedSkills = computed<SkillEntry[]>(() => {
    const { skills } = this.character();
    return SKILLS_DATA.map(s => skills[s.name]).filter(Boolean).filter(s => !s.trained);
  });

  getSkillAttr(name: string): string {
    if (name === this.character().magicSchool) return 'WIL';
    return SKILLS_DATA.find(s => s.name === name)?.attribute ?? '';
  }

  updateSkillLevel(name: string, value: number): void {
    const { skills } = this.character();
    if (!skills[name] || !Number.isFinite(value)) return;
    this.patch.emit({
      skills: { ...skills, [name]: { ...skills[name], level: Math.max(1, Math.min(18, value)) } },
    });
  }

  toggleAdvancementMark(name: string): void {
    const { skills } = this.character();
    const skill = skills[name];
    if (!skill) return;
    this.patch.emit({
      skills: { ...skills, [name]: { ...skill, advancementMarks: (skill.advancementMarks + 1) % 3 } },
    });
  }
}
