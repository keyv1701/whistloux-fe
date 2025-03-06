import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastSubject = new BehaviorSubject<Toast | null>(null);
  toast$ = this.toastSubject.asObservable();

  show(type: 'success' | 'error' | 'warning' | 'info', message: string, duration = 5000): void {
    this.toastSubject.next({type, message, duration});
  }

  clear(): void {
    this.toastSubject.next(null);
  }

  success(message: string, duration = 5000): void {
    this.show('success', message, duration);
  }

  error(message: string, duration = 5000): void {
    this.show('error', message, duration);
  }

  warning(message: string, duration = 5000): void {
    this.show('warning', message, duration);
  }

  info(message: string, duration = 5000): void {
    this.show('info', message, duration);
  }
}
