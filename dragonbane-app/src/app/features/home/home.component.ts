import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CharacterService } from '../../services/character.service';
import { CharacterDraftService } from '../../services/character-draft.service';
import { Character } from '../../models/character.models';
import { IconComponent } from '../../shared/icon/icon.component';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink, IconComponent],
  templateUrl: './home.component.html',
})
export class HomeComponent {
  private characterService = inject(CharacterService);
  private draftService = inject(CharacterDraftService);
  private router = inject(Router);

  readonly characters = this.characterService.characters;
  deleteConfirmId: string | null = null;

  createNew(): void {
    this.draftService.reset();
    this.router.navigate(['/create']);
  }

  exportJson(character: Character): void {
    const blob = new Blob([JSON.stringify(character, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${character.name || 'character'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  confirmDelete(id: string): void {
    this.deleteConfirmId = id;
  }

  cancelDelete(): void {
    this.deleteConfirmId = null;
  }

  deleteCharacter(id: string): void {
    this.characterService.delete(id);
    this.deleteConfirmId = null;
  }

  isDraft(char: Character): boolean {
    return !char.attributes;
  }
}
