import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CharacterService, parseCharacterFile } from '../../services/character.service';
import { CharacterDraftService } from '../../services/character-draft.service';
import { Character } from '../../models/character.models';
import { IconComponent } from '../../shared/icon/icon.component';
import { WakingEyesComponent } from './waking-eyes/waking-eyes.component';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink, IconComponent, WakingEyesComponent],
  templateUrl: './home.component.html',
})
export class HomeComponent {
  private characterService = inject(CharacterService);
  private draftService = inject(CharacterDraftService);
  private router = inject(Router);

  readonly characters = this.characterService.characters;
  deleteConfirmId: string | null = null;
  readonly importMessage = signal<{ text: string; failed: boolean } | null>(null);

  createNew(): void {
    this.draftService.reset();
    this.router.navigate(['/create']);
  }

  // From the empty roster, open the dragon's eyes before leaving. A tap on a
  // phone never hovers the button, so without the pause the eyes go unseen.
  private wakingBeforeCreate = false;
  createFirst(eyes: WakingEyesComponent): void {
    if (this.wakingBeforeCreate) return;
    this.wakingBeforeCreate = true;
    eyes.wake(true);
    setTimeout(() => this.createNew(), 500);
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

  async importFiles(input: HTMLInputElement): Promise<void> {
    const files = [...(input.files ?? [])];
    input.value = ''; // so the same file can be picked again
    if (!files.length) return;

    const imported: Character[] = [];
    const rejected: string[] = [];
    for (const file of files) {
      const characters = parseCharacterFile(await file.text());
      if (characters.length) imported.push(...characters);
      else rejected.push(file.name);
    }
    this.characterService.importCharacters(imported);

    const parts: string[] = [];
    if (imported.length === 1) parts.push(`Imported ${imported[0].name || 'an unnamed hero'}.`);
    else if (imported.length > 1) parts.push(`Imported ${imported.length} characters.`);
    if (rejected.length) parts.push(`Couldn't read ${rejected.join(', ')}: not a Dragonbane character file.`);
    this.importMessage.set({ text: parts.join(' '), failed: rejected.length > 0 });
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
