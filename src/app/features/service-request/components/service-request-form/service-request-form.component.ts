import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UI_COMPONENTS } from '../../../../shared/components/ui';
import { SelectOption } from '../../service-request.models';
import { DEPARTMENTS, PRIORITIES, REQUEST_TYPES } from '../../service-request.config';
import { ServiceRequest } from '../../../service-requests/service-requests.types';

@Component({
  selector: 'app-service-request-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ...UI_COMPONENTS],
  templateUrl: './service-request-form.component.html',
  styleUrls: ['./service-request-form.component.scss']
})
export class ServiceRequestFormComponent {
  @Input() set requestData(data: ServiceRequest | null) {
    if (data) {
      this.requestForm.patchValue(data);
    }
  }
    @Output() formSubmit = new EventEmitter<ServiceRequest>();
  @Output() formClose = new EventEmitter<void>();

  private fb = inject(FormBuilder);

  requestForm: FormGroup;
  isSubmitting = false;
  isDragging = false;
  files: File[] = [];

  readonly requestTypes: readonly SelectOption[] = REQUEST_TYPES;
  readonly priorities: readonly SelectOption[] = PRIORITIES;
  readonly departments: readonly SelectOption[] = DEPARTMENTS;

  constructor() {
    this.requestForm = this.fb.group({
      type: ['', Validators.required],
      title: ['', Validators.required],
      priority: ['medium', Validators.required],
      department: ['', Validators.required],
      description: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  isFieldInvalid(controlName: string): boolean {
    const control = this.requestForm.get(controlName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  onSubmit(): void {
    if (this.requestForm.valid) {
      this.isSubmitting = true;

            // Construct a full ServiceRequest object
      const serviceRequest: ServiceRequest = {
        id: '', // Assuming ID is generated by the backend
        status: 'new', // Default status
        ...this.requestForm.value,
        attachments: this.files,
        submittedDate: new Date().toISOString(),
      };
      this.formSubmit.emit(serviceRequest);
    } else {
      Object.keys(this.requestForm.controls).forEach((key) => {
        const control = this.requestForm.get(key);
        control?.markAsTouched();
      });
    }
  }

  close(): void {
    this.formClose.emit();
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(): void {
    this.isDragging = false;
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
      const maxSize = 10 * 1024 * 1024; // 10MB
      return file.size <= maxSize;
    });

    this.files = [...this.files, ...newFiles];
  }

  removeFile(index: number): void {
    this.files = this.files.filter((_, i) => i !== index);
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
