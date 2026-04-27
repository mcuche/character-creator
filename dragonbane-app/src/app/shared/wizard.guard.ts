import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CharacterDraftService } from '../services/character-draft.service';
import { CharacterDraft } from '../models/character.models';

function firstUnlockedStep(draft: CharacterDraft): string {
  if (!draft.kin) return 'kin';
  if (!draft.profession) return 'profession';
  if (draft.profession === 'Mage' && !draft.magicSchool) return 'mage-school';
  if (!draft.age) return 'age';
  if (!draft.attributes) return 'attributes';
  if (!draft.derivedStats) return 'derived';
  const hasSkills = draft.skills && Object.values(draft.skills).some(s => s.trained);
  if (!hasSkills) return 'skills';
  return 'summary'; // weakness, gear, memento, appearance, summary are always unlocked once skills are done
}

const STEP_ORDER = [
  'kin', 'profession', 'mage-school', 'age', 'attributes',
  'derived', 'skills', 'weakness', 'gear', 'memento', 'appearance', 'summary',
];

export const wizardGuard: CanActivateFn = (route) => {
  const draft = inject(CharacterDraftService).draft();
  const router = inject(Router);
  const target = route.url[0]?.path ?? 'kin';

  const firstUnlocked = firstUnlockedStep(draft);
  const targetIdx = STEP_ORDER.indexOf(target);
  const unlockedIdx = STEP_ORDER.indexOf(firstUnlocked);

  // Always allow going back to completed steps
  if (targetIdx <= unlockedIdx) return true;

  // Skip mage-school check for non-mages
  if (target === 'mage-school' && draft.profession !== 'Mage') {
    return router.createUrlTree(['/create/age']);
  }

  return router.createUrlTree(['/create', firstUnlocked]);
};
