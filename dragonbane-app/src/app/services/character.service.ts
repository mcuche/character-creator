import { Injectable, signal, computed } from '@angular/core';
import { Character } from '../models/character.models';
import { normalizeGear } from '../data/gear.data';

const STORAGE_KEY = 'dragonbane_characters';

@Injectable({ providedIn: 'root' })
export class CharacterService {
  private _characters = signal<Character[]>(this.load());

  readonly characters = this._characters.asReadonly();
  readonly count = computed(() => this._characters().length);

  private load(): Character[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const list: Character[] = raw ? JSON.parse(raw) : [];
      // Older saves lack gear types and equipped flags; the next save stores them
      return list.map(c => ({ ...c, gear: normalizeGear(c.gear ?? []) }));
    } catch {
      return [];
    }
  }

  private save(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this._characters()));
  }

  getById(id: string): Character | undefined {
    return this._characters().find(c => c.id === id);
  }

  add(character: Character): void {
    this._characters.update(list => [...list, character]);
    this.save();
  }

  update(character: Character): void {
    this._characters.update(list =>
      list.map(c => c.id === character.id ? { ...character, updatedAt: new Date().toISOString() } : c)
    );
    this.save();
  }

  delete(id: string): void {
    this._characters.update(list => list.filter(c => c.id !== id));
    this.save();
  }
}
