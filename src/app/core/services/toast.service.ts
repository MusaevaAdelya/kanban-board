// core/services/toast.service.ts
import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private toasts = signal<Toast[]>([]);

  readonly allToasts = this.toasts.asReadonly();

  show(type: Toast['type'], message: string, duration = 3000): void {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const toast: Toast = { id, type, message };

    this.toasts.update(toasts => [...toasts, toast]);

    // Auto remove after duration
    setTimeout(() => {
      this.remove(id);
    }, duration);
  }

  success(message: string, duration = 3000): void {
    this.show('success', message, duration);
  }

  error(message: string, duration = 4000): void {
    this.show('error', message, duration);
  }

  info(message: string, duration = 3000): void {
    this.show('info', message, duration);
  }

  remove(id: string): void {
    this.toasts.update(toasts => toasts.filter(t => t.id !== id));
  }
}