import { Component, inject, signal, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService, Theme } from '../../../core/services/theme.service';
import { IconComponent } from '../../components/ui/icon/icon.component';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './theme-toggle.component.html',
  styleUrls: ['./theme-toggle.component.scss'],
})
export class ThemeToggleComponent {
  themeService = inject(ThemeService);
  private elementRef = inject(ElementRef);
  isMenuOpen = signal(false);

  toggleMenu(): void {
    this.isMenuOpen.update((open) => !open);
  }

  setTheme(theme: Theme): void {
    this.themeService.setTheme(theme);
    this.isMenuOpen.set(false);
  }

  // Close dropdown when clicking outside
  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    if (!(event.target as HTMLElement).closest('app-theme-toggle')) {
      this.isMenuOpen.set(false);
    }
  }

  // Handle keyboard navigation
  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (this.isMenuOpen()) {
      switch (event.key) {
        case 'Escape':
          this.isMenuOpen.set(false);
          event.preventDefault();
          break;
        case 'ArrowDown':
          this.focusNextMenuItem(1);
          event.preventDefault();
          break;
        case 'ArrowUp':
          this.focusNextMenuItem(-1);
          event.preventDefault();
          break;
        case 'Tab':
          // Let tab navigation work normally but close menu on tab out
          setTimeout(() => {
            if (!this.elementRef.nativeElement.contains(document.activeElement)) {
              this.isMenuOpen.set(false);
            }
          }, 0);
          break;
      }
    } else if (event.key === 'Enter' || event.key === ' ') {
      // Open menu on Enter or Space when the toggle button is focused
      if ((event.target as HTMLElement).tagName === 'BUTTON') {
        this.toggleMenu();
        event.preventDefault();
        setTimeout(() => this.focusFirstMenuItem(), 0);
      }
    }
  }

  // Focus handling for menu items
  private focusFirstMenuItem(): void {
    const menuItems = this.getMenuItems();
    if (menuItems.length > 0) {
      menuItems[0].focus();
    }
  }

  private focusNextMenuItem(direction: number): void {
    const menuItems = this.getMenuItems();
    const currentIndex = menuItems.findIndex((item) => item === document.activeElement);

    if (currentIndex >= 0) {
      const nextIndex = (currentIndex + direction + menuItems.length) % menuItems.length;
      menuItems[nextIndex].focus();
    } else {
      this.focusFirstMenuItem();
    }
  }

  private getMenuItems(): HTMLButtonElement[] {
    return Array.from(this.elementRef.nativeElement.querySelectorAll('[role="menuitem"]'));
  }
}
