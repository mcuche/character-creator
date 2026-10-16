import { Component, computed, input, output } from '@angular/core';
import { Character, SkillEntry } from '../../../../models/character.models';
import { SKILLS_DATA } from '../../../../data/skills.data';
import { IconComponent } from '../../../../shared/icon/icon.component';

const MAX_MARKS = 2;

@Component({
  selector: 'app-sheet-skills',
  imports: [IconComponent],
  templateUrl: './sheet-skills.component.html',
})
export class SheetSkillsComponent {
  readonly character = input.required<Character>();
  readonly patch = output<Partial<Character>>();

  protected readonly marks = Array.from({ length: MAX_MARKS }, (_, i) => i);

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

  isMagicSchool(name: string): boolean {
    return name === this.character().magicSchool;
  }

  /** Commits on change (blur / Enter) so typing "1" then "2" reaches 12. */
  commitLevel(name: string, input: HTMLInputElement): void {
    const current = this.character().skills[name];
    if (!current) return;
    const parsed = parseInt(input.value, 10);
    const level = Number.isFinite(parsed) ? Math.max(1, Math.min(18, parsed)) : current.level;
    // The binding won't refresh when the model value is unchanged (e.g. 25 → 18 at 18), so sync the DOM.
    input.value = String(level);
    if (level !== current.level) this.updateSkillLevel(name, level);
  }

  updateSkillLevel(name: string, value: number): void {
    const { skills } = this.character();
    if (!skills[name] || !Number.isFinite(value)) return;
    this.patch.emit({
      skills: { ...skills, [name]: { ...skills[name], level: Math.max(1, Math.min(18, value)) } },
    });
  }

  /** Clicking mark i sets the count to i+1; clicking the last filled mark clears it back to i. */
  setAdvancementMark(name: string, index: number): void {
    const { skills } = this.character();
    const skill = skills[name];
    if (!skill) return;
    const next = skill.advancementMarks === index + 1 ? index : index + 1;
    this.patch.emit({
      skills: { ...skills, [name]: { ...skill, advancementMarks: next } },
    });
  }
}
