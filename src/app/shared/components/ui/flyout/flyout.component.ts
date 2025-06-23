import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, state, style, transition, animate } from '@angular/animations';

import { IconComponent } from '../icon/icon.component';

export type FlyoutPosition = 'right' | 'left' | 'bottom';
export type FlyoutSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';

@Component({
  selector: 'app-flyout',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './flyout.component.html',
  styleUrls: ['./flyout.component.scss'],
  animations: [
    trigger('rightFlyout', [
      state('void', style({ transform: 'translateX(100%)', opacity: 0 })),
      state('visible', style({ transform: 'translateX(0)', opacity: 1 })),
      transition('void => visible', animate('300ms ease-out')),
      transition('visible => void', animate('200ms ease-in')),
    ]),
    trigger('leftFlyout', [
      state('void', style({ transform: 'translateX(-100%)', opacity: 0 })),
      state('visible', style({ transform: 'translateX(0)', opacity: 1 })),
      transition('void => visible', animate('300ms ease-out')),
      transition('visible => void', animate('200ms ease-in')),
    ]),
    trigger('bottomFlyout', [
      state('void', style({ transform: 'translateY(100%)', opacity: 0 })),
      state('visible', style({ transform: 'translateY(0)', opacity: 1 })),
      transition('void => visible', animate('300ms ease-out')),
      transition('visible => void', animate('200ms ease-in')),
    ]),
    trigger('backdrop', [
      state('void', style({ opacity: 0 })),
      state('visible', style({ opacity: 1 })),
      transition('void => visible', animate('300ms ease-out')),
      transition('visible => void', animate('200ms ease-in')),
    ]),
  ],
})
export class FlyoutComponent {
  @Input() isOpen = false;
  @Input() position: FlyoutPosition = 'right';
  @Input() size: FlyoutSize = 'md';
  @Input() showBackdrop = true;
  @Input() closeOnBackdropClick = true;
  @Input() closeOnEscape = true;
  @Input() title = '';

  @Output() closed = new EventEmitter<void>();

  get animationState(): string {
    return this.isOpen ? 'visible' : 'void';
  }

  get sizeClass(): string {
    switch (this.size) {
      case 'xs':
        return 'max-w-xs';
      case 'sm':
        return 'max-w-sm';
      case 'md':
        return 'max-w-md';
      case 'lg':
        return 'max-w-lg';
      case 'xl':
        return 'max-w-xl';
      case 'full':
        return 'max-w-full';
      default:
        return 'max-w-md';
    }
  }

  get positionClasses(): string {
    switch (this.position) {
      case 'right':
        return 'right-0 top-0 h-full';
      case 'left':
        return 'left-0 top-0 h-full';
      case 'bottom':
        return 'bottom-0 left-0 right-0 w-full';
      default:
        return 'right-0 top-0 h-full';
    }
  }

  get containerClasses(): string {
    return `fixed z-50 bg-white dark:bg-neutral-800 shadow-lg overflow-hidden flex flex-col ${this.positionClasses} ${this.sizeClass}`;
  }

  onClickOutside(): void {
    if (this.closeOnBackdropClick) {
      this.close();
    }
  }

  @HostListener('document:keydown.escape')
  onEscapePressed(): void {
    if (this.isOpen && this.closeOnEscape) {
      this.close();
    }
  }

  close(): void {
    this.isOpen = false;
    this.closed.emit();
  }
}
