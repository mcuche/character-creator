import { Component, ElementRef, inject } from '@angular/core';

// One eye, drawn on a 100 grid and placed by each eye's transform. Lid paths
// share their command structure so SMIL can interpolate closed <-> open.
const LID_MASK = {
  closed: 'M-50 150 V52 H8 C28 40 72 40 92 52 H150 V150 Z',
  open: 'M-50 150 V52 H8 C28 28 72 28 92 52 H150 V150 Z',
};
const OUTLINE = {
  closed: 'M8 52 C28 40 72 40 92 52 C72 76 28 76 8 52 Z',
  open: 'M8 52 C28 28 72 28 92 52 C72 76 28 76 8 52 Z',
};
// Solid iris with the slit pupil cut out (evenodd).
const IRIS = 'M35 52 A15 15 0 1 0 65 52 A15 15 0 1 0 35 52 Z M50 37 C55.5 45 55.5 59 50 67 C44.5 59 44.5 45 50 37 Z';
const HORNED_BROW = 'M10 40 C18 30 26 24 36 20 L42 9 L48 17 L58 15 L66 4 L70 15 L82 13 L94 6 L86 24';

/**
 * Empty-roster emblem: a pair of horned dragon eyes, half-lidded until
 * `wake(true)` opens them. The home screen wakes them while
 * "Create a Character" is hovered or focused.
 */
@Component({
  selector: 'app-waking-eyes',
  templateUrl: './waking-eyes.component.html',
  host: { 'aria-hidden': 'true' },
})
export class WakingEyesComponent {
  private host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly lid = LID_MASK;
  protected readonly outline = OUTLINE;
  protected readonly iris = IRIS;
  protected readonly brow = HORNED_BROW;
  // Each transform reads right to left: move the eye's centre (50, 46 on its grid)
  // to the origin, scale, tilt the inner corner down 12°, then place it. The left
  // eye is mirrored so its horns sweep outward. At y 32 the eyes rest on the bottom
  // of the 140 × 50 viewBox, so the heading's margin is the whole gap below them.
  protected readonly eyes = [
    { id: 'left', transform: 'translate(40 32) rotate(12) scale(-0.6 0.6) translate(-50 -46)' },
    { id: 'right', transform: 'translate(100 32) rotate(-12) scale(0.6 0.6) translate(-50 -46)' },
  ];

  wake(open: boolean): void {
    const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const animations = this.host.nativeElement.querySelectorAll<SVGAnimateElement>(open ? 'animate.open' : 'animate.close');
    for (const animation of animations) {
      animation.setAttribute('dur', reduceMotion ? '1ms' : '420ms');
      animation.beginElement();
    }
  }
}
