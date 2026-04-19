import { Component, Input, Output, EventEmitter, inject, OnChanges, OnDestroy } from '@angular/core';
import { WizardNavService } from '../../services/wizard-nav.service';

@Component({
  selector: 'app-step-nav',
  imports: [],
  template: ``,
})
export class StepNavComponent implements OnChanges, OnDestroy {
  @Input() backPath?: string;
  @Input() canContinue = true;
  @Input() nextLabel = 'Continue →';
  @Output() next = new EventEmitter<void>();

  private nav = inject(WizardNavService);
  private sub = this.nav.nextTrigger$.subscribe(() => this.next.emit());

  ngOnChanges(): void {
    this.nav.backPath.set(this.backPath);
    this.nav.canContinue.set(this.canContinue);
    this.nav.nextLabel.set(this.nextLabel);
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
    this.nav.backPath.set(undefined);
    this.nav.canContinue.set(true);
    this.nav.nextLabel.set('Continue →');
  }
}
