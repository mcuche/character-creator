import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CharacterDraftService } from '../../../../services/character-draft.service';
import { PROFESSION_DATA } from '../../../../data/professions.data';
import { Profession } from '../../../../models/character.models';
import { StepNavComponent } from '../../../../shared/step-nav/step-nav.component';
import { ConfirmModalComponent } from '../../../../shared/confirm-modal/confirm-modal.component';
import { IconComponent } from '../../../../shared/icon/icon.component';

@Component({
  selector: 'app-profession',
  imports: [CommonModule, StepNavComponent, ConfirmModalComponent, IconComponent],
  templateUrl: './profession.component.html',
})
export class ProfessionComponent {
  private draftService = inject(CharacterDraftService);
  private router = inject(Router);

  readonly draft = this.draftService.draft;
  readonly professions = PROFESSION_DATA;
  rolledIndex = signal<number | null>(null);
  pendingProfession = signal<Profession | null>(null);

  get selected(): Profession | undefined {
    return this.draft().profession;
  }

  get hasDownstreamData(): boolean {
    const skills = this.draft().skills ?? {};
    return Object.values(skills).some(s => s.trained);
  }

  rollRandom(): void {
    const roll = Math.floor(Math.random() * 10) + 1;
    const prof = PROFESSION_DATA[roll - 1];
    this.rolledIndex.set(roll - 1);
    this.trySelect(prof.name);
  }

  select(profession: Profession): void {
    this.rolledIndex.set(null);
    this.trySelect(profession);
  }

  trySelect(profession: Profession): void {
    if (profession === this.selected) return;
    if (this.hasDownstreamData) {
      this.pendingProfession.set(profession);
    } else {
      this.draftService.setProfession(profession);
    }
  }

  confirmChange(): void {
    const p = this.pendingProfession();
    if (p) this.draftService.setProfession(p);
    this.pendingProfession.set(null);
  }

  cancelChange(): void {
    this.rolledIndex.set(null);
    this.pendingProfession.set(null);
  }

  continue(): void {
    const draft = this.draft();
    if (draft.profession === 'Mage') {
      this.router.navigate(['/create/mage-school']);
    } else {
      this.router.navigate(['/create/age']);
    }
  }
}
