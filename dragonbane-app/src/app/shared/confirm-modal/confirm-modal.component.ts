import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-modal',
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div class="mx-4 w-full max-w-sm rounded-xl border border-amber-800/40 bg-stone-900 p-6 shadow-2xl">
        <h3 class="font-display mb-2 text-lg font-bold text-amber-300">{{ title }}</h3>
        <p class="mb-6 text-sm leading-relaxed text-stone-400">{{ message }}</p>
        <div class="flex gap-3">
          <button
            (click)="cancel.emit()"
            class="flex-1 rounded-lg border border-stone-700 py-2 text-sm font-medium text-stone-300 transition hover:border-stone-500 hover:text-white">
            Cancel
          </button>
          <button
            (click)="confirm.emit()"
            class="flex-1 rounded-lg bg-amber-600 py-2 text-sm font-semibold text-stone-950 transition hover:bg-amber-500">
            {{ confirmLabel }}
          </button>
        </div>
      </div>
    </div>
  `,
})
export class ConfirmModalComponent {
  @Input() title = 'Are you sure?';
  @Input() message = '';
  @Input() confirmLabel = 'Continue';
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
}
