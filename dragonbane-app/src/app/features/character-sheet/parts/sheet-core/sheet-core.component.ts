import { Component, computed, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AttributeKey, Attributes, Character } from '../../../../models/character.models';
import { applyAgeModifiers, applyAttributeEdit } from '../../../../services/character-rules.service';

const ATTR_KEYS: AttributeKey[] = ['STR', 'CON', 'AGL', 'INT', 'WIL', 'CHA'];

@Component({
  selector: 'app-sheet-core',
  imports: [FormsModule],
  templateUrl: './sheet-core.component.html',
})
export class SheetCoreComponent {
  readonly Math = Math;
  readonly character = input.required<Character>();
  readonly patch = output<Partial<Character>>();

  readonly attrKeys = ATTR_KEYS;

  /** Age-adjusted scores — the values HP/WP/movement are derived from. */
  readonly finalAttributes = computed<Attributes | null>(() => {
    const c = this.character();
    if (!c.attributes) return null;
    return c.age ? applyAgeModifiers(c.attributes, c.age) : c.attributes;
  });

  updateAttribute(attr: AttributeKey, finalValue: number): void {
    if (!Number.isFinite(finalValue)) return;
    this.patch.emit(applyAttributeEdit(this.character(), attr, finalValue));
  }
}
