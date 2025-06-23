import {
  Injectable,
  signal,
  computed,
  effect,
  afterNextRender,
  inject,
  DestroyRef,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';

export type Theme = 'light' | 'dark' | 'system';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly window = this.document.defaultView;
  private readonly destroyRef = inject(DestroyRef);

  private readonly storageKey = 'lnyqe-theme';
  private readonly prefersDarkMedia = this.window?.matchMedia('(prefers-color-scheme: dark)');

  // Reactive state management with signals
  private readonly theme = signal<Theme>(this.getInitialTheme());
  private readonly systemPrefersDark = signal(this.prefersDarkMedia?.matches ?? false);

  // Computed value to determine if dark mode is active
  readonly isDarkMode = computed(() => {
    const currentTheme = this.theme();
    if (currentTheme === 'system') {
      return this.systemPrefersDark();
    }
    return currentTheme === 'dark';
  });

  // Expose the current theme as a readable computed signal
  readonly currentTheme = computed(() => this.theme());

  constructor() {
    // This effect runs on initialization and whenever isDarkMode changes,
    // ensuring the theme is always in sync with the state.
    effect(() => {
      this.applyTheme(this.isDarkMode());
    });

    // Use afterNextRender for browser-specific APIs
    afterNextRender(() => {
      const mediaQueryListener = (e: MediaQueryListEvent) => {
        this.systemPrefersDark.set(e.matches);
      };

      this.prefersDarkMedia?.addEventListener('change', mediaQueryListener);

      // Clean up the listener when the service is destroyed
      this.destroyRef.onDestroy(() => {
        this.prefersDarkMedia?.removeEventListener('change', mediaQueryListener);
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
