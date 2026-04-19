import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CharacterDraftService } from '../../../../services/character-draft.service';
import { Appearance } from '../../../../models/character.models';
import { StepNavComponent } from '../../../../shared/step-nav/step-nav.component';

@Component({
  selector: 'app-appearance',
  imports: [CommonModule, FormsModule, StepNavComponent],
  templateUrl: './appearance.component.html',
})
export class AppearanceComponent {
  private draftService = inject(CharacterDraftService);
  private router = inject(Router);

  readonly draft = this.draftService.draft;

  height = signal('');
  build = signal('');
  hair = signal('');
  eyes = signal('');
  skin = signal('');
  distinguishingFeatures = signal('');

  constructor() {
    const a = this.draft().appearance;
    if (a) {
      this.height.set(a.height ?? '');
      this.build.set(a.build ?? '');
      this.hair.set(a.hair ?? '');
      this.eyes.set(a.eyes ?? '');
      this.skin.set(a.skin ?? '');
      this.distinguishingFeatures.set(a.distinguishingFeatures ?? '');
    }
  }

  continue(): void {
    const appearance: Appearance = {
      height: this.height() || undefined,
      build: this.build() || undefined,
      hair: this.hair() || undefined,
      eyes: this.eyes() || undefined,
      skin: this.skin() || undefined,
      distinguishingFeatures: this.distinguishingFeatures() || undefined,
    };
    this.draftService.setAppearance(appearance);
    this.router.navigate(['/create/summary']);
  }
}
