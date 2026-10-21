import { Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class WizardNavService {
  readonly backPath = signal<string | undefined>(undefined);
  readonly canContinue = signal(true);
  readonly nextLabel = signal('Continue');
  readonly nextArrow = signal(true);
  readonly nextTrigger$ = new Subject<void>();
}
