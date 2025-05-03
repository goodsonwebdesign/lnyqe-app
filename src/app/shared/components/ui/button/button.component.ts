import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NgClass, CommonModule } from '@angular/common';

export type ButtonVariant = 'primary' | 'secondary' | 'neutral' | 'danger' | 'success' | 'warning' | 'ghost';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [NgClass, CommonModule],
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss']
})
export class ButtonComponent {
  @Input() variant: ButtonVariant = 'primary';
  @Input() size: ButtonSize = 'md';
  @Input() rounded: 'none' | 'sm' | 'md' | 'lg' | 'full' = 'md';
  @Input() disabled = false;
  @Input() loading = false;
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() fullWidth = false;

  @Output() buttonClick = new EventEmitter<MouseEvent>();

  get baseClasses(): string {
    return 'relative inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-neutral-900';
  }

  get sizeClasses(): string {
    const sizes = {
      xs: 'text-xs px-2 py-1',
      sm: 'text-sm px-3 py-1.5',
      md: 'text-sm px-4 py-2',
      lg: 'text-base px-5 py-2.5',
      xl: 'text-lg px-6 py-3'
    };

    return sizes[this.size];
  }

  get variantClasses(): string {
    const variants = {
      primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
      secondary: 'bg-secondary-600 text-white hover:bg-secondary-700 focus:ring-secondary-500',
      neutral: 'bg-neutral-200 text-neutral-800 hover:bg-neutral-300 dark:bg-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-600 focus:ring-neutral-500',
      danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
      success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
      warning: 'bg-amber-500 text-white hover:bg-amber-600 focus:ring-amber-500',
      ghost: 'bg-transparent text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800 focus:ring-neutral-500'
    };

    return variants[this.variant];
  }

  get roundedClasses(): string {
    const roundedValues = {
      none: 'rounded-none',
      sm: 'rounded-sm',
      md: 'rounded-md',
      lg: 'rounded-lg',
      full: 'rounded-full'
    };

    return roundedValues[this.rounded];
  }

  get disabledClasses(): string {
    return 'opacity-50 cursor-not-allowed pointer-events-none';
  }

  get loadingColorClasses(): string {
    const loadingColors = {
      primary: 'border-white',
      secondary: 'border-white',
      neutral: 'border-neutral-800 dark:border-neutral-200',
      danger: 'border-white',
      success: 'border-white',
      warning: 'border-white',
      ghost: 'border-neutral-700 dark:border-neutral-300'
    };

    return loadingColors[this.variant];
  }

  onClick(event: MouseEvent): void {
    if (!this.disabled && !this.loading) {
      this.buttonClick.emit(event);
    }
  }
}
