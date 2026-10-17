import { CanDeactivateFn } from '@angular/router';
import type { WizardComponent } from '../features/wizard/wizard.component';

// Fires only when leaving /create entirely — moving between wizard steps
// keeps the parent route active, so no prompt there.
export const wizardExitGuard: CanDeactivateFn<WizardComponent> = (component) =>
  component.confirmExit();
