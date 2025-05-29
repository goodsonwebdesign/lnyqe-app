import {
  Component,
  inject,
  ChangeDetectionStrategy,
  OnDestroy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FlyoutService } from '../../core/services/flyout/flyout.service';
import { Subject, takeUntil } from 'rxjs';
import { UI_COMPONENTS } from '../../shared/components/ui';

interface SelectOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-service-request',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ...UI_COMPONENTS],
  templateUrl: './service-request.component.html',
  styleUrls: ['./service-request.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServiceRequestComponent implements OnDestroy {
  private fb = inject(FormBuilder);
  private flyoutService = inject(FlyoutService);
  private cd = inject(ChangeDetectorRef);
  private destroy$ = new Subject<void>();

  isOpen = false;
  requestForm: FormGroup;
  editing = false;
  isSubmitting = false;
  isDragging = false;
  files: File[] = [];

  requestTypes: SelectOption[] = [
    { label: 'Maintenance', value: 'maintenance' },
    { label: 'IT Support', value: 'it-support' },
    { label: 'Facilities', value: 'facilities' },
    { label: 'Security', value: 'security' },
    { label: 'Other', value: 'other' },
  ];

  priorities: SelectOption[] = [
    { label: 'Low', value: 'low' },
    { label: 'Medium', value: 'medium' },
    { label: 'High', value: 'high' },
    { label: 'Urgent', value: 'urgent' },
  ];

  departments: SelectOption[] = [
    { label: 'Administration', value: 'administration' },
    { label: 'HR', value: 'hr' },
    { label: 'IT', value: 'it' },
    { label: 'Finance', value: 'finance' },
    { label: 'Operations', value: 'operations' },
    { label: 'Sales', value: 'sales' },
    { label: 'Marketing', value: 'marketing' },
  ];

  constructor() {
    this.requestForm = this.fb.group({
      type: ['', Validators.required],
      title: ['', Validators.required],
      priority: ['medium', Validators.required],
      department: ['', Validators.required],
      description: ['', [Validators.required, Validators.minLength(10)]],
    });

    this.flyoutService
      .getState()
      .pipe(takeUntil(this.destroy$))
      .subscribe((state) => {
        if (state.type === 'service-request') {
          this.isOpen = state.isOpen;

          if (state.isOpen) {
            this.requestForm.reset({
              priority: 'medium',
            });
            this.files = [];
            this.editing = state.data?.editing || false;

            if (this.editing && state.data?.request) {
              const request = state.data.request;
              this.requestForm.patchValue({
                type: request.type,
                title: request.title,
                priority: request.priority,
                department: request.department,
                description: request.description,
              });

              if (request.files) {
                this.files = [...request.files];
              }
            }
          }

          this.cd.markForCheck();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  close(): void {
    this.flyoutService.closeFlyout();
  }

  isFieldInvalid(controlName: string): boolean {
    const control = this.requestForm.get(controlName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  onSubmit(): void {
    if (this.requestForm.valid) {
      this.isSubmitting = true;
      this.cd.markForCheck();

      setTimeout(() => {
        const formData = {
          ...this.requestForm.value,
          files: this.files,
        };

        console.log('Submitting request:', formData);

        this.isSubmitting = false;
        this.close();
      }, 1000);
    } else {
      Object.keys(this.requestForm.controls).forEach((key) => {
        const control = this.requestForm.get(key);
        control?.markAsTouched();
      });
      this.cd.markForCheck();
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
    this.cd.markForCheck();
  }

  onDragLeave(): void {
    this.isDragging = false;
    this.cd.markForCheck();
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    if (event.dataTransfer?.files) {
      this.handleFiles(event.dataTransfer.files);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.handleFiles(input.files);
    }
  }

  private handleFiles(fileList: FileList): void {
    const newFiles = Array.from(fileList).filter((file) => {
      const maxSize = 10 * 1024 * 1024;
      return file.size <= maxSize;
    });

    this.files = [...this.files, ...newFiles];
    this.cd.markForCheck();
  }

  removeFile(index: number): void {
    this.files = this.files.filter((_, i) => i !== index);
    this.cd.markForCheck();
  }

  isImageFile(file: File): boolean {
    return file.type.startsWith('image/');
  }

  isPdfFile(file: File): boolean {
    return file.type === 'application/pdf';
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
