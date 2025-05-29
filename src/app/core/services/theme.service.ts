import {
  Injectable,
  signal,
  computed,
  effect,
  afterNextRender,
  inject,
  runInInjectionContext,
  DestroyRef,
  Injector,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';

export type Theme = 'light' | 'dark' | 'system';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private document = inject(DOCUMENT);
  private window = this.document.defaultView;
  private destroyRef = inject(DestroyRef);
  private injector = inject(Injector);

  private prefersDarkMedia = this.window?.matchMedia('(prefers-color-scheme: dark)');
  private storageKey = 'lnyqe-theme';

  // Use signals for reactive state management
  private theme = signal<Theme>(this.getInitialTheme());

  // Computed value to determine if dark mode is active
  readonly isDarkMode = computed(() => {
    const theme = this.theme();
    if (theme === 'system') {
      return this.prefersDarkMedia?.matches ?? false;
    }
    return theme === 'dark';
  });

  // Expose the current theme as a readable computed signal
  readonly currentTheme = computed(() => this.theme());

  constructor() {
    // Set up the effect to apply theme changes to the DOM
    afterNextRender(() => {
      // Initialize theme based on stored preference or system default
      this.applyTheme(this.isDarkMode());

      // Listen for system theme changes
      this.prefersDarkMedia?.addEventListener('change', (e) => {
        if (this.theme() === 'system') {
          this.applyTheme(e.matches);
        }
      });

      // Set up the effect to handle theme changes - using runInInjectionContext
      runInInjectionContext(this.injector, () => {
        effect(() => {
          this.applyTheme(this.isDarkMode());
        });
      });
    });
  }

  // Public method to change the theme
  setTheme(theme: Theme): void {
    this.theme.set(theme);
    localStorage.setItem(this.storageKey, theme);
  }

  // Private method to apply theme to DOM
  private applyTheme(isDark: boolean): void {
    const root = this.document.documentElement;

    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }

  // Get initial theme from local storage or use system as default
  private getInitialTheme(): Theme {
    const savedTheme = localStorage.getItem(this.storageKey) as Theme | null;
    return savedTheme || 'system';
  }
}
