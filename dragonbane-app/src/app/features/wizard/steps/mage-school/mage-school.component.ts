import { Component, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CharacterDraftService } from '../../../../services/character-draft.service';
import { MAGIC_SCHOOLS, SPELLS_DATA } from '../../../../data/magic.data';
import { MagicSchool } from '../../../../models/character.models';
import { StepNavComponent } from '../../../../shared/step-nav/step-nav.component';

@Component({
  selector: 'app-mage-school',
  imports: [CommonModule, StepNavComponent],
  templateUrl: './mage-school.component.html',
})
export class MageSchoolComponent {
  private draftService = inject(CharacterDraftService);
  private router = inject(Router);

  readonly draft = this.draftService.draft;
  readonly schools = MAGIC_SCHOOLS;

  selectedSchool = signal<MagicSchool | null>(null);
  selectedSpells = signal<Set<string>>(new Set());
  selectedTricks = signal<Set<string>>(new Set());

  constructor() {
    const draft = this.draft();
    if (draft.magicSchool) this.selectedSchool.set(draft.magicSchool);
    if (draft.preparedSpells?.length) this.selectedSpells.set(new Set(draft.preparedSpells));
    if (draft.magicTricks?.length) this.selectedTricks.set(new Set(draft.magicTricks));
  }

  availableSpells = computed(() => {
    const school = this.selectedSchool();
    if (!school) return [];
    return SPELLS_DATA.filter(s => !s.isTrick && s.rank === 1 && (s.school === school || s.school === 'General'));
  });

  availableTricks = computed(() => {
    const school = this.selectedSchool();
    if (!school) return [];
    return SPELLS_DATA.filter(s => s.isTrick && (s.school === school || s.school === 'General'));
  });

  selectSchool(school: MagicSchool): void {
    this.selectedSchool.set(school);
    this.selectedSpells.set(new Set());
    this.selectedTricks.set(new Set());
  }

  toggleSpell(name: string): void {
    const set = new Set(this.selectedSpells());
    if (set.has(name)) {
      set.delete(name);
    } else if (set.size < 3) {
      set.add(name);
    }
    this.selectedSpells.set(set);
  }

  toggleTrick(name: string): void {
    const set = new Set(this.selectedTricks());
    if (set.has(name)) {
      set.delete(name);
    } else if (set.size < 3) {
      set.add(name);
    }
    this.selectedTricks.set(set);
  }

  get canContinue(): boolean {
    return !!this.selectedSchool() &&
      this.selectedSpells().size === 3 &&
      this.selectedTricks().size === 3;
  }

  continue(): void {
    const school = this.selectedSchool()!;
    this.draftService.setMageSchool(school, [...this.selectedSpells()], [...this.selectedTricks()]);
    this.router.navigate(['/create/age']);
  }
}
