import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { Subscription } from 'rxjs';
import { Toast, ToastService } from '../../../../core/services/toast/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss'],
  animations: [
    trigger('toastAnimation', [
      state('void', style({ transform: 'translateY(100%)', opacity: 0 })),
      state('*', style({ transform: 'translateY(0)', opacity: 1 })),
      transition('void <=> *', animate('300ms ease-in-out')),
    ]),
  ],
})
export class ToastComponent implements OnInit, OnDestroy {
  toast: Toast | null = null;
  private subscription!: Subscription;
  private timeoutId?: ReturnType<typeof setTimeout>;

  private toastService = inject(ToastService);

  ngOnInit(): void {
    this.subscription = this.toastService.toastState$.subscribe((toast) => {
      this.toast = toast;
      if (toast) {
        if (this.timeoutId) {
          clearTimeout(this.timeoutId);
        }
        this.timeoutId = setTimeout(() => {
          this.toastService.hide();
        }, toast.duration || 3000);
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }

  get a_test_id() {
    return this.toast ? `toast-${this.toast.type}` : 'toast-hidden';
  }
}
