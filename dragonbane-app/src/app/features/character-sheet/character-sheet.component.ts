import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CharacterService } from '../../services/character.service';
import { Character } from '../../models/character.models';
import { SheetVitalsComponent } from './parts/sheet-vitals/sheet-vitals.component';
import { SheetCoreComponent } from './parts/sheet-core/sheet-core.component';
import { SheetSkillsComponent } from './parts/sheet-skills/sheet-skills.component';
import { SheetAbilitiesComponent } from './parts/sheet-abilities/sheet-abilities.component';
import { SheetGearComponent } from './parts/sheet-gear/sheet-gear.component';

type SheetTab = 'core' | 'skills' | 'abilities' | 'gear';

const TABS: { id: SheetTab; label: string }[] = [
  { id: 'core', label: 'Core' },
  { id: 'skills', label: 'Skills' },
  { id: 'abilities', label: 'Abilities' },
  { id: 'gear', label: 'Gear' },
];

@Component({
  selector: 'app-character-sheet',
  imports: [
    RouterLink,
    SheetVitalsComponent,
    SheetCoreComponent,
    SheetSkillsComponent,
    SheetAbilitiesComponent,
    SheetGearComponent,
  ],
  templateUrl: './character-sheet.component.html',
})
export class CharacterSheetComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private characterService = inject(CharacterService);

  readonly tabs = TABS;
  activeTab = signal<SheetTab>('core');

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

  save(): void {
    const char = this.character();
    if (char) {
      this.characterService.update(char);
    }
  }

  /** Merge a change from one of the sheet parts and persist it. */
  patch(partial: Partial<Character>): void {
    this.character.update(c => c ? { ...c, ...partial } : c);
    this.save();
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
