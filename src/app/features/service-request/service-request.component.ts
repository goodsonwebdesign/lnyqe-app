import { Component, inject, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ButtonComponent } from '../../shared/components/ui/button/button.component';
import { FlyoutService } from '../../core/services/flyout/flyout.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-service-request',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent],
  templateUrl: './service-request.component.html',
  styleUrls: ['./service-request.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ServiceRequestComponent implements OnDestroy {
  private fb = inject(FormBuilder);
  private flyoutService = inject(FlyoutService);
  private cd = inject(ChangeDetectorRef);
  private destroy$ = new Subject<void>();

  isOpen = false;
  serviceRequestForm: FormGroup;

  constructor() {
    // Initialize the form
    this.serviceRequestForm = this.fb.group({
      requestType: ['', Validators.required],
      description: ['', Validators.required],
      priority: ['medium', Validators.required],
      location: ['', Validators.required]
    });

    // Subscribe to flyout service
    this.flyoutService.getState()
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        if (state.type === 'service-request') {
          this.isOpen = state.isOpen;

          if (state.isOpen) {
            this.serviceRequestForm.reset({
              priority: 'medium'
            });
          }

          // Ensure change detection runs since we're using OnPush
          this.cd.markForCheck();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  closeFlyout(): void {
    this.flyoutService.closeFlyout();
  }

  onSubmit(): void {
    if (this.serviceRequestForm.valid) {
      // Process the form submission
      this.closeFlyout();
    } else {
      Object.keys(this.serviceRequestForm.controls).forEach(key => {
        const control = this.serviceRequestForm.get(key);
        control?.markAsTouched();
      });
      // Mark for check to update validation errors in the UI
      this.cd.markForCheck();
    }
  }

  isInvalid(controlName: string): boolean {
    const control = this.serviceRequestForm.get(controlName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }
}
