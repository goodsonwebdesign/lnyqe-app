import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Toast {
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private toastSubject = new BehaviorSubject<Toast | null>(null);
  toastState$: Observable<Toast | null> = this.toastSubject.asObservable();

  show(toast: Toast): void {
    this.toastSubject.next(toast);
  }

  hide(): void {
    this.toastSubject.next(null);
  }
}
