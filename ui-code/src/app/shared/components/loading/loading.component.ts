import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingService } from '../../../core/services/loading.service';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="loadingService.loading$ | async" class="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/40 backdrop-blur-[2px] transition-all duration-300">
      <div class="bg-white p-6 rounded-2xl shadow-2xl border border-slate-200 flex flex-col items-center space-y-4 animate-in fade-in zoom-in duration-300">
        <div class="relative w-12 h-12">
          <!-- Outer Ring -->
          <div class="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
          <!-- Spinning Ring -->
          <div class="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <p class="text-sm font-bold text-slate-700 tracking-wide uppercase">Processing...</p>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class LoadingComponent {
  constructor(public loadingService: LoadingService) {}
}
