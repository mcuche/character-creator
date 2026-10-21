import { Component, inject, computed, signal } from '@angular/core';
import { RouterOutlet, RouterLink, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { filter } from 'rxjs/operators';
import { CharacterDraftService } from '../../services/character-draft.service';
import { WizardNavService } from '../../services/wizard-nav.service';
import { WIZARD_STEPS } from '../../shared/wizard-steps';
import { ConfirmModalComponent } from '../../shared/confirm-modal/confirm-modal.component';
import { IconComponent } from '../../shared/icon/icon.component';

function wizardStepIndex(path: string): number {
  return WIZARD_STEPS.findIndex(s => s.path === path);
}

const STEPS = WIZARD_STEPS.filter(s => s.path !== 'mage-school');

// Swipe-to-dismiss for the mobile steps panel
const SWIPE_SLOP_PX = 10;             // horizontal travel before a touch counts as a swipe
const SWIPE_CLOSE_FRACTION = 0.3;     // release past this share of the panel width to close
const SWIPE_FLICK_PX_PER_MS = 0.5;    // or flick left faster than this...
const SWIPE_FLICK_MIN_PX = 30;        // ...over at least this distance
const SWIPE_VELOCITY_WINDOW_MS = 80;  // flick speed is measured over the last moments of the swipe
const SIDEBAR_SETTLE_MS = 200;        // keep in sync with .sidebar-panel.is-settling

const HERO_BANNER_COLLAPSED_KEY = 'dragonbane_hero_banner_collapsed';

function readHeroBannerCollapsed(): boolean {
  try {
    return localStorage.getItem(HERO_BANNER_COLLAPSED_KEY) === 'true';
  } catch {
    return false;
  }
}

@Component({
  selector: 'app-wizard',
  imports: [RouterOutlet, RouterLink, CommonModule, FormsModule, ConfirmModalComponent, IconComponent],
  templateUrl: './wizard.component.html',
})
export class WizardComponent {
  draftService = inject(CharacterDraftService);
  readonly wizardNav = inject(WizardNavService);
  private router = inject(Router);

  readonly draft = this.draftService.draft;
  readonly steps = STEPS;

  currentPath = '';

  constructor() {
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe((e: NavigationEnd) => {
      const segments = e.urlAfterRedirects.split('/');
      this.currentPath = segments[segments.length - 1] ?? '';
      this.draftService.advanceHighWaterMark(this.currentPath);
    });
    const segments = this.router.url.split('/');
    this.currentPath = segments[segments.length - 1] ?? '';
    this.draftService.advanceHighWaterMark(this.currentPath);
  }

  get currentStepIndex(): number {
    return this.steps.findIndex(s => s.path === this.currentPath);
  }

  get visibleSteps() {
    const draft = this.draft();
    if (draft.profession === 'Mage') {
      // Insert mage-school between profession and age
      const idx = STEPS.findIndex(s => s.path === 'profession');
      const result = [...STEPS];
      result.splice(idx + 1, 0, { path: 'mage-school', label: 'Magic School' });
      return result;
    }
    return STEPS;
  }

  get currentVisibleIndex(): number {
    return this.visibleSteps.findIndex(s => s.path === this.currentPath);
  }

  sidebarOpen = signal(false);
  /** How far the mobile steps panel is swiped toward the left edge, as a share of its width (0 to -1). */
  sidebarDrag = signal(0);
  /** True while the panel glides to rest (snap back or slide out) rather than tracking the finger. */
  sidebarSettling = signal(false);
  /** True while a swiped-away panel slides out; it no longer takes taps. */
  sidebarDismissing = signal(false);

  private swipe: {
    id: number;
    originX: number;
    width: number;
    moved: boolean;
    samples: { x: number; t: number }[];
  } | null = null;
  private settleTimer?: ReturnType<typeof setTimeout>;
  // A swipe that ends over a step, the ✕ or the backdrop also fires a click; ignore it until the next touch
  private swipeJustEnded = false;

  toggleSidebar(): void {
    // A tap on the edge tab while a swiped panel is still sliding out means "open"
    const open = this.sidebarDismissing() || !this.sidebarOpen();
    this.resetSidebarDrag();
    this.sidebarOpen.set(open);
  }

  closeSidebar(): void {
    this.resetSidebarDrag();
    this.sidebarOpen.set(false);
  }

  onSidebarCloseClick(): void {
    if (!this.swipeJustEnded) this.closeSidebar();
  }

  onBackdropClick(): void {
    if (!this.swipeJustEnded) this.closeSidebar();
  }

  onSidebarPointerDown(e: PointerEvent, panel: HTMLElement): void {
    this.swipeJustEnded = false;
    if (e.pointerType === 'mouse' || this.swipe || this.sidebarSettling()) return;
    this.swipe = { id: e.pointerId, originX: e.clientX, width: panel.offsetWidth, moved: false, samples: [] };
  }

  onSidebarPointerMove(e: PointerEvent): void {
    const swipe = this.swipe;
    if (!swipe || e.pointerId !== swipe.id) return;
    if (!swipe.moved) {
      if (e.clientX - swipe.originX > -SWIPE_SLOP_PX) return;
      // Track from here so the panel doesn't jump by the slop distance
      swipe.moved = true;
      swipe.originX = e.clientX;
    }
    swipe.samples = [
      ...swipe.samples.filter(s => e.timeStamp - s.t <= SWIPE_VELOCITY_WINDOW_MS),
      { x: e.clientX, t: e.timeStamp },
    ];
    const dx = Math.min(0, e.clientX - swipe.originX);
    this.sidebarDrag.set(Math.max(dx / swipe.width, -1));
  }

  onSidebarPointerUp(e: PointerEvent): void {
    const swipe = this.swipe;
    if (!swipe || e.pointerId !== swipe.id) return;
    this.swipe = null;
    if (!swipe.moved) return;
    this.swipeJustEnded = true;

    const recent = swipe.samples.find(s => e.timeStamp - s.t <= SWIPE_VELOCITY_WINDOW_MS) ?? swipe.samples.at(-1)!;
    const velocity = (e.clientX - recent.x) / Math.max(1, e.timeStamp - recent.t);
    const flick = this.sidebarDrag() * swipe.width < -SWIPE_FLICK_MIN_PX && velocity < -SWIPE_FLICK_PX_PER_MS;
    this.settleSidebar(this.sidebarDrag() < -SWIPE_CLOSE_FRACTION || flick);
  }

  // The browser took over the gesture (e.g. vertical scroll of the step list)
  onSidebarPointerCancel(e: PointerEvent): void {
    if (!this.swipe || e.pointerId !== this.swipe.id) return;
    const moved = this.swipe.moved;
    this.swipe = null;
    if (moved) this.settleSidebar(false);
  }

  private settleSidebar(dismiss: boolean): void {
    this.sidebarSettling.set(true);
    this.sidebarDismissing.set(dismiss);
    this.sidebarDrag.set(dismiss ? -1 : 0);
    const ms = matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : SIDEBAR_SETTLE_MS;
    this.settleTimer = setTimeout(() => (dismiss ? this.closeSidebar() : this.sidebarSettling.set(false)), ms);
  }

  private resetSidebarDrag(): void {
    clearTimeout(this.settleTimer);
    this.swipe = null;
    this.sidebarDrag.set(0);
    this.sidebarSettling.set(false);
    this.sidebarDismissing.set(false);
  }

  heroBannerCollapsed = signal(readHeroBannerCollapsed());

  toggleHeroBanner(): void {
    this.heroBannerCollapsed.update(v => !v);
    try {
      localStorage.setItem(HERO_BANNER_COLLAPSED_KEY, String(this.heroBannerCollapsed()));
    } catch {
      // Storage unavailable — the toggle still works for this visit
    }
  }

  updateName(name: string): void {
    this.draftService.setName(name);
  }

  onBack(): void {
    const back = this.wizardNav.backPath();
    if (back) this.router.navigate(['/create', back]);
  }

  onContinue(): void {
    this.wizardNav.nextTrigger$.next();
  }

  isVisited(path: string): boolean {
    const furthest = this.draft().wizardFurthestStep;
    if (!furthest) return false;
    return wizardStepIndex(path) <= wizardStepIndex(furthest);
  }

  // Resolver for the exit prompt currently on screen, if any
  private resolveExit: ((leave: boolean) => void) | null = null;
  exitPromptOpen = signal(false);

  confirmExit(): boolean | Promise<boolean> {
    // Nothing chosen yet (or the draft was just saved and reset) — leave freely
    if (!this.draft().kin) return true;
    this.exitPromptOpen.set(true);
    return new Promise(resolve => (this.resolveExit = resolve));
  }

  answerExit(leave: boolean): void {
    // Home always starts a fresh draft, so leaving abandons this one for good
    if (leave) this.draftService.reset();
    this.exitPromptOpen.set(false);
    this.resolveExit?.(leave);
    this.resolveExit = null;
  }

  navigateToStep(path: string): void {
    if (this.swipeJustEnded) return;
    if (this.isVisited(path) && path !== this.currentPath) {
      this.router.navigate(['/create', path]);
      this.closeSidebar();
    }
  }
}
