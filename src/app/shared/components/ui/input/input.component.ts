import { Component, Input, forwardRef, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
})
export class InputComponent implements ControlValueAccessor {
  @Input() id = `input-${Math.random().toString(36).substring(2, 11)}`;
  @Input() label?: string;
  @Input() placeholder = '';
  @Input() type: 'text' | 'password' | 'email' | 'number' | 'tel' | 'url' | 'search' | 'date' =
    'text';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() required = false;
  @Input() disabled = false;
  @Input() readonly = false;
  @Input() error?: string;
  @Input() helperText?: string;
  @Input() icon = false;
  @Input() ariaLabel?: string;
  @Input() dataTestId?: string;

  @HostBinding('class.w-full') isFullWidth = true;

  value: string | number | null = '';
  touched = false;
  onChange: (value: string | number | null) => void = () => { /* c8 ignore next */ };
  onTouched: () => void = () => { /* c8 ignore next */ };

  readonly baseClasses = 'block w-full rounded-md shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-600 dark:bg-neutral-800 dark:text-neutral-100';

  get sizeClasses(): string {
    const sizes = {
      sm: 'px-2 py-1 text-sm',
      md: 'px-3 py-2',
      lg: 'px-4 py-3 text-lg',
    };

    return sizes[this.size];
  }

  readonly standardClasses = 'border border-neutral-300 dark:border-neutral-600';

  readonly errorClasses = 'border-red-500 dark:border-red-600 focus:ring-red-500 dark:focus:ring-red-600';

  readonly disabledClasses = 'bg-neutral-100 dark:bg-neutral-700 cursor-not-allowed opacity-75';

  onInputChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    this.onChange(this.value);
  }

  onBlur(): void {
    if (!this.touched) {
      this.touched = true;
      this.onTouched();
    }
  }

  writeValue(value: string | number | null): void {
    this.value = value;
  }

  registerOnChange(fn: (value: string | number | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
