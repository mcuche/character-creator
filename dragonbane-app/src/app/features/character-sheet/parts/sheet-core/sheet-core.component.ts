import { Component, computed, input, output } from '@angular/core';
import { Appearance, AttributeKey, Attributes, Character } from '../../../../models/character.models';
import { applyAgeModifiers, applyAttributeEdit } from '../../../../services/character-rules.service';
import { IconComponent } from '../../../../shared/icon/icon.component';

/** Physical and mental halves — rendered as two columns on wide screens. */
const ATTR_GROUPS: AttributeKey[][] = [['STR', 'CON', 'AGL'], ['INT', 'WIL', 'CHA']];

const ATTR_NAMES: Record<AttributeKey, string> = {
  STR: 'Strength', CON: 'Constitution', AGL: 'Agility',
  INT: 'Intelligence', WIL: 'Willpower', CHA: 'Charisma',
};

const APPEARANCE_LABELS: { key: keyof Appearance; label: string }[] = [
  { key: 'height', label: 'Height' },
  { key: 'build', label: 'Build' },
  { key: 'hair', label: 'Hair' },
  { key: 'eyes', label: 'Eyes' },
  { key: 'skin', label: 'Skin' },
  { key: 'distinguishingFeatures', label: 'Features' },
];

const ATTR_MIN = 1;
const ATTR_MAX = 18;

function ageAdjusted(c: Character): Attributes | null {
  if (!c.attributes) return null;
  return c.age ? applyAgeModifiers(c.attributes, c.age) : c.attributes;
}

@Component({
  selector: 'app-sheet-core',
  imports: [IconComponent],
  templateUrl: './sheet-core.component.html',
})
export class SheetCoreComponent {
  readonly character = input.required<Character>();
  readonly patch = output<Partial<Character>>();

  readonly attrGroups = ATTR_GROUPS;
  readonly attrNames = ATTR_NAMES;
  readonly attrMin = ATTR_MIN;
  readonly attrMax = ATTR_MAX;

  /** Age-adjusted scores — the values HP/WP/movement are derived from. */
  readonly finalAttributes = computed<Attributes | null>(() => ageAdjusted(this.character()));

  readonly carryCapacity = computed(() => {
    const attrs = this.finalAttributes();
    return attrs ? Math.ceil(attrs.STR / 2) : null;
  });

  readonly appearanceRows = computed(() => {
    const a = this.character().appearance ?? {};
    return APPEARANCE_LABELS
      .filter(f => !!a[f.key]?.trim())
      .map(f => ({ label: f.label, value: a[f.key] as string }));
  });

  iconFor(attr: AttributeKey): string {
    return `attributes/${attr.toLowerCase()}`;
  }

  /** Raw (pre-age) score, or null when age leaves this attribute unchanged. */
  baseScore(attr: AttributeKey): number | null {
    const raw = this.character().attributes?.[attr];
    const final = this.finalAttributes()?.[attr];
    return raw !== undefined && raw !== final ? raw : null;
  }

  canDecrease(attr: AttributeKey): boolean {
    const raw = this.character().attributes?.[attr] ?? ATTR_MIN;
    const final = this.finalAttributes()?.[attr] ?? ATTR_MIN;
    return raw > ATTR_MIN && final > ATTR_MIN;
  }

  canIncrease(attr: AttributeKey): boolean {
    const raw = this.character().attributes?.[attr] ?? ATTR_MAX;
    const final = this.finalAttributes()?.[attr] ?? ATTR_MAX;
    return raw < ATTR_MAX && final < ATTR_MAX;
  }

  step(attr: AttributeKey, delta: number): void {
    const final = this.finalAttributes()?.[attr];
    if (final === undefined) return;
    this.updateAttribute(attr, final + delta);
  }

  /**
   * Commit a typed score on change/blur/Enter — never per keystroke, so typing
   * "1" then "6" lands on 16. The field is then rewritten with the value that
   * actually took effect (clamping and age offsets may change it), since the
   * binding alone won't refresh when the stored score is unchanged.
   */
  commitAttribute(attr: AttributeKey, el: HTMLInputElement): void {
    const typed = el.valueAsNumber;
    const char = this.character();
    if (!Number.isFinite(typed) || !char.attributes) {
      el.value = String(this.finalAttributes()?.[attr] ?? '');
      return;
    }
    const next = this.updateAttribute(attr, typed);
    el.value = String(ageAdjusted(next ?? char)?.[attr] ?? '');
  }

  updateAttribute(attr: AttributeKey, finalValue: number): Character | null {
    if (!Number.isFinite(finalValue)) return null;
    const char = this.character();
    const next = applyAttributeEdit(char, attr, finalValue);
    if (next.attributes?.[attr] === char.attributes?.[attr]) return next;
    const { attributes, derivedStats, skills, currentHP, currentWP } = next;
    this.patch.emit({ attributes, derivedStats, skills, currentHP, currentWP });
    return next;
  }
}
