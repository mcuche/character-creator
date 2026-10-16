import { Component, computed, input } from '@angular/core';

/**
 * Glyph from `public/graphics/`, painted with `currentColor` through a CSS mask
 * so it follows the surrounding text color (hover, active, accent states).
 *
 *   <app-icon name="attributes/str" [size]="28" />
 */
@Component({
  selector: 'app-icon',
  template: ``,
  host: {
    class: 'app-icon',
    '[style.width.px]': 'size()',
    '[style.height.px]': 'size()',
    '[style.--icon]': 'maskUrl()',
    '[attr.role]': 'label() ? "img" : null',
    '[attr.aria-label]': 'label() || null',
    '[attr.aria-hidden]': 'label() ? null : "true"',
  },
})
export class IconComponent {
  /** Path under `/graphics/` without the extension, e.g. `professions/mage`. */
  readonly name = input.required<string>();
  readonly size = input(24);
  /** Accessible name; the icon is decorative (aria-hidden) when omitted. */
  readonly label = input<string>();

  protected readonly maskUrl = computed(() => `url(/graphics/${this.name()}.svg)`);
}
