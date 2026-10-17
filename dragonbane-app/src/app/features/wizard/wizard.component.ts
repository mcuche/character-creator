import { Component, inject, computed, signal } from '@angular/core';
import { RouterOutlet, RouterLink, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { filter } from 'rxjs/operators';
import { CharacterDraftService } from '../../services/character-draft.service';
import { WizardNavService } from '../../services/wizard-nav.service';
import { WIZARD_STEPS } from '../../shared/wizard-steps';
import { ConfirmModalComponent } from '../../shared/confirm-modal/confirm-modal.component';

function wizardStepIndex(path: string): number {
  return WIZARD_STEPS.findIndex(s => s.path === path);
}

const STEPS = WIZARD_STEPS.filter(s => s.path !== 'mage-school');

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
  imports: [RouterOutlet, RouterLink, CommonModule, FormsModule, ConfirmModalComponent],
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

  toggleSidebar(): void { this.sidebarOpen.update(v => !v); }
  closeSidebar(): void { this.sidebarOpen.set(false); }

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
    if (this.isVisited(path) && path !== this.currentPath) {
      this.router.navigate(['/create', path]);
      this.closeSidebar();
    }
  }
}
