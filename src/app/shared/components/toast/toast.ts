// shared/components/toast/toast.ts
import { Component, inject } from '@angular/core';
import { ToastService } from '../../../core/services/toast.service';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroCheckCircle,
  heroXCircle,
  heroInformationCircle,
  heroXMark,
} from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [NgIcon],
  providers: [
    provideIcons({
      heroCheckCircle,
      heroXCircle,
      heroInformationCircle,
      heroXMark,
    }),
  ],
  templateUrl: './toast.html',
  styleUrl: './toast.scss',
})
export class Toast {
  toastService = inject(ToastService);

  getToastClasses(type: string): string {
    const baseClasses = '';
    switch (type) {
      case 'success':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'error':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'info':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  }

  getIcon(type: string): string {
    switch (type) {
      case 'success':
        return 'heroCheckCircle';
      case 'error':
        return 'heroXCircle';
      case 'info':
        return 'heroInformationCircle';
      default:
        return 'heroInformationCircle';
    }
  }
}
