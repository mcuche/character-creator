import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CharacterDraftService } from '../../../../services/character-draft.service';
import { CharacterService } from '../../../../services/character.service';

@Component({
  selector: 'app-summary',
  imports: [CommonModule, RouterLink],
  templateUrl: './summary.component.html',
})
export class SummaryComponent {
  private draftService = inject(CharacterDraftService);
  private characterService = inject(CharacterService);
  private router = inject(Router);

  readonly draft = this.draftService.draft;

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

  getAttr(attr: string): number | undefined {
    return (this.draft().attributes as Record<string, number> | undefined)?.[attr];
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
