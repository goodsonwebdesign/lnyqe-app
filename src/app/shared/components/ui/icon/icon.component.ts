// filepath: /Users/brandongoodson/Documents/GitHub/lnyqe-app-new/lnyqe-app/src/app/shared/components/ui/icon/icon.component.ts
import { Component, Input, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Icon component that wraps Iconify icons with standardized sizing and styling.
 * This provides a consistent way to use icons throughout the application.
 * 
 * Usage:
 * <app-icon name="mdi:home" size="md"></app-icon>
 */
@Component({
  selector: 'app-icon',
  standalone: true,
  imports: [CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA], // Add schema for custom elements
  template: `
    <iconify-icon 
      [icon]="name" 
      [style.fontSize]="sizeMap[size] || sizeMap['md']" 
      [style.width]="sizeMap[size] || sizeMap['md']"
      [style.height]="sizeMap[size] || sizeMap['md']"
      [style.verticalAlign]="'middle'"
      [class]="className">
    </iconify-icon>
  `,
  styles: [
    `
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    `
  ]
})
export class IconComponent {
  /**
   * The icon name to display. Uses the Iconify naming format:
   * 'prefix:icon-name', e.g., 'mdi:home'
   */
  @Input() name: string = '';
  
  /**
   * The size of the icon. Available options: xs, sm, md, lg, xl
   */
  @Input() size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'md';

  /**
   * Optional CSS class to apply to the icon
   */
  @Input() className: string = '';

  /**
   * Map of size names to pixel values
   */
  sizeMap: Record<string, string> = {
    'xs': '1rem',    // 16px
    'sm': '1.25rem', // 20px
    'md': '1.5rem',  // 24px
    'lg': '2rem',    // 32px
    'xl': '2.5rem'   // 40px
  };
}