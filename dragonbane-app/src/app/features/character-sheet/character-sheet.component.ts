import { Component, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CharacterService } from '../../services/character.service';
import { Character, Condition, AttributeKey, SkillEntry } from '../../models/character.models';
import { KIN_DATA } from '../../data/kin.data';
import { PROFESSION_DATA } from '../../data/professions.data';
import { SKILLS_DATA } from '../../data/skills.data';
import { deriveStats } from '../../services/character-rules.service';

const CONDITIONS: Condition[] = ['Exhausted', 'Sickly', 'Dazed', 'Angry', 'Scared', 'Disheartened'];
const CONDITION_ATTRS: Record<Condition, string> = {
  Exhausted: 'STR', Sickly: 'CON', Dazed: 'AGL', Angry: 'INT', Scared: 'WIL', Disheartened: 'CHA',
};
const ATTR_KEYS: AttributeKey[] = ['STR', 'CON', 'AGL', 'INT', 'WIL', 'CHA'];

@Component({
  selector: 'app-character-sheet',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './character-sheet.component.html',
})
export class CharacterSheetComponent {
  readonly Math = Math;
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private characterService = inject(CharacterService);

  readonly conditions = CONDITIONS;
  readonly conditionAttrs = CONDITION_ATTRS;
  readonly attrKeys = ATTR_KEYS;

  activeTab = signal<'core' | 'skills' | 'abilities' | 'gear'>('core');

  character = signal<Character | null>(null);

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const char = this.characterService.getById(id);
      if (char) {
        this.character.set({ ...char, gold: char.gold ?? 0, silver: char.silver ?? 0, copper: char.copper ?? 0 });
      } else {
        this.router.navigate(['/']);
      }
    }
  }

  get kinData() {
    return KIN_DATA.find(k => k.name === this.character()?.kin);
  }

  get professionData() {
    return PROFESSION_DATA.find(p => p.name === this.character()?.profession);
  }

  get trainedSkills(): SkillEntry[] {
    const skills = this.character()?.skills ?? {};
    return SKILLS_DATA.map(s => skills[s.name]).filter(Boolean).filter(s => s.trained);
  }

  get untrainedSkills(): SkillEntry[] {
    const skills = this.character()?.skills ?? {};
    return SKILLS_DATA.map(s => skills[s.name]).filter(Boolean).filter(s => !s.trained);
  }

  getSkillAttr(name: string): string {
    return SKILLS_DATA.find(s => s.name === name)?.attribute ?? '';
  }

  save(): void {
    const char = this.character();
    if (char) {
      this.characterService.update(char);
    }
  }

  updateField<K extends keyof Character>(field: K, value: Character[K]): void {
    this.character.update(c => c ? { ...c, [field]: value } : c);
    this.save();
  }

  updateCurrentHP(delta: number): void {
    const char = this.character();
    if (!char) return;
    const max = char.derivedStats?.hp ?? 0;
    const next = Math.max(0, Math.min(max, char.currentHP + delta));
    this.updateField('currentHP', next);
  }

  updateCurrentWP(delta: number): void {
    const char = this.character();
    if (!char) return;
    const max = char.derivedStats?.wp ?? 0;
    const next = Math.max(0, Math.min(max, char.currentWP + delta));
    this.updateField('currentWP', next);
  }

  toggleCondition(condition: Condition): void {
    const char = this.character();
    if (!char) return;
    const has = char.conditions.includes(condition);
    const next = has ? char.conditions.filter(c => c !== condition) : [...char.conditions, condition];
    this.updateField('conditions', next);
  }

  hasCondition(condition: Condition): boolean {
    return this.character()?.conditions.includes(condition) ?? false;
  }

  updateSkillLevel(name: string, value: number): void {
    const char = this.character();
    if (!char) return;
    const updated = {
      ...char.skills,
      [name]: { ...char.skills[name], level: Math.max(1, Math.min(18, value)) },
    };
    this.updateField('skills', updated);
  }

  updateAttributeValue(attr: AttributeKey, value: number): void {
    const char = this.character();
    if (!char?.attributes) return;
    const updated = { ...char.attributes, [attr]: Math.max(1, Math.min(18, value)) };
    this.updateField('attributes', updated);
  }

  toggleAdvancementMark(name: string): void {
    const char = this.character();
    if (!char) return;
    const skill = char.skills[name];
    if (!skill) return;
    const marks = (skill.advancementMarks + 1) % 3;
    const updated = {
      ...char.skills,
      [name]: { ...skill, advancementMarks: marks },
    };
    this.updateField('skills', updated);
  }

  updateCurrency(type: 'gold' | 'silver' | 'copper', delta: number): void {
    const char = this.character();
    if (!char) return;
    const current = char[type] ?? 0;
    this.updateField(type, Math.max(0, current + delta));
  }

  exportJson(): void {
    const char = this.character();
    if (!char) return;
    const blob = new Blob([JSON.stringify(char, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${char.name || 'character'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
