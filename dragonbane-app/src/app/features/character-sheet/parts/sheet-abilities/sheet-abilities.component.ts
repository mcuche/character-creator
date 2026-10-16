import { Component, computed, input } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { Character } from '../../../../models/character.models';
import { KIN_DATA, KinAbility } from '../../../../data/kin.data';
import { PROFESSION_DATA } from '../../../../data/professions.data';
import { MAGIC_SCHOOLS, SPELLS_DATA, SpellData } from '../../../../data/magic.data';
import { IconComponent } from '../../../../shared/icon/icon.component';

interface HeroicAbilityView {
  name: string;
  description?: string;
  /** Profession the ability comes from, when it isn't the character's own. */
  source?: string;
}

interface SpellView {
  name: string;
  data?: SpellData;
}

@Component({
  selector: 'app-sheet-abilities',
  imports: [IconComponent, NgTemplateOutlet],
  templateUrl: './sheet-abilities.component.html',
})
export class SheetAbilitiesComponent {
  readonly character = input.required<Character>();

  readonly kinData = computed(() => KIN_DATA.find(k => k.name === this.character().kin));

  /** Kin abilities; the multi-ability list takes precedence over the single legacy fields. */
  readonly innateAbilities = computed<KinAbility[]>(() => {
    const kin = this.kinData();
    if (!kin) return [];
    if (kin.innateAbilities?.length) return kin.innateAbilities;
    return [{ name: kin.innateAbilityName, description: kin.innateAbilityDescription, wp: kin.innateAbilityWP }];
  });

  readonly heroicAbilities = computed<HeroicAbilityView[]>(() => {
    const { heroicAbilities, profession } = this.character();
    return heroicAbilities.map(name => {
      const prof = PROFESSION_DATA.find(p => p.heroicAbilityName.toLowerCase() === name.toLowerCase());
      if (!prof) return { name };
      return {
        name: prof.heroicAbilityName,
        description: prof.heroicAbilityDescription,
        source: prof.name === profession ? undefined : prof.name,
      };
    });
  });

  readonly school = computed(() => {
    const name = this.character().magicSchool;
    return name ? MAGIC_SCHOOLS.find(s => s.name === name) ?? { name, theme: '', description: '' } : undefined;
  });

  readonly spells = computed<SpellView[]>(() => this.character().preparedSpells.map(n => this.resolveSpell(n)));
  readonly tricks = computed<SpellView[]>(() => this.character().magicTricks.map(n => this.resolveSpell(n)));

  wpLabel(wp: number | 'free'): string {
    return wp === 'free' ? 'Free' : `${wp} WP`;
  }

  /** Icon for a spell's school; general magic has its own glyph. */
  spellIcon(spell: SpellView): string {
    const school = spell.data?.school ?? this.character().magicSchool;
    return !school || school === 'General' ? 'magic/general-magic' : `magic/${school.toLowerCase()}`;
  }

  private resolveSpell(name: string): SpellView {
    return { name, data: SPELLS_DATA.find(s => s.name === name) };
  }
}
