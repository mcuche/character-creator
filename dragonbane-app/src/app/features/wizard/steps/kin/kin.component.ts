import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CharacterDraftService } from '../../../../services/character-draft.service';
import { KIN_DATA, KinData } from '../../../../data/kin.data';
import { Kin } from '../../../../models/character.models';
import { StepNavComponent } from '../../../../shared/step-nav/step-nav.component';
import { IconComponent } from '../../../../shared/icon/icon.component';

@Component({
  selector: 'app-kin',
  imports: [CommonModule, StepNavComponent, IconComponent],
  templateUrl: './kin.component.html',
})
export class KinComponent {
  private draftService = inject(CharacterDraftService);
  private router = inject(Router);

  readonly draft = this.draftService.draft;
  readonly kinOptions = KIN_DATA;
  rolledIndex = signal<number | null>(null);

  get selected(): Kin | undefined {
    return this.draft().kin;
  }

  rollRandom(): void {
    const roll = Math.floor(Math.random() * 12) + 1;
    let kin: KinData;
    if (roll <= 4) kin = KIN_DATA[0];
    else if (roll <= 7) kin = KIN_DATA[1];
    else if (roll <= 9) kin = KIN_DATA[2];
    else if (roll === 10) kin = KIN_DATA[3];
    else if (roll === 11) kin = KIN_DATA[4];
    else kin = KIN_DATA[5];

    this.rolledIndex.set(KIN_DATA.indexOf(kin));
    this.draftService.setKin(kin.name);
  }

  select(kin: Kin): void {
    this.rolledIndex.set(null);
    this.draftService.setKin(kin);
  }

  continue(): void {
    this.router.navigate(['/create/profession']);
  }
}
