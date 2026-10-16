import { Component, computed, input } from '@angular/core';
import { Character } from '../../../../models/character.models';
import { KIN_DATA } from '../../../../data/kin.data';
import { PROFESSION_DATA } from '../../../../data/professions.data';

@Component({
  selector: 'app-sheet-abilities',
  templateUrl: './sheet-abilities.component.html',
})
export class SheetAbilitiesComponent {
  readonly character = input.required<Character>();

  readonly kinData = computed(() => KIN_DATA.find(k => k.name === this.character().kin));
  readonly professionData = computed(() => PROFESSION_DATA.find(p => p.name === this.character().profession));
}
