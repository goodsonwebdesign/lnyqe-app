import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { selectCurrentUser } from '../../store/selectors/auth.selectors';
import { ThemeService, Theme } from '../../core/services/theme.service';
import { UI_COMPONENTS } from '../../shared/components/ui';

@Component({
  selector: 'app-user-preferences',
  standalone: true,
  imports: [CommonModule, FormsModule, ...UI_COMPONENTS],
  templateUrl: './user-preferences.component.html',
  styleUrl: './user-preferences.component.scss'
})
export class UserPreferencesComponent implements OnInit, OnDestroy {
  user: any = null;
  private store = inject(Store);
  private themeService = inject(ThemeService);
  private subscriptions = new Subscription();

  currentTheme: Theme = 'system';
  themeOptions: { value: Theme, label: string }[] = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'system', label: 'System Default' }
  ];

  ngOnInit(): void {
    // Subscribe to user data from the store
    this.subscriptions.add(
      this.store.select(selectCurrentUser).subscribe(user => {
        this.user = user;
      })
    );

    // Get current theme setting
    this.currentTheme = this.themeService.currentTheme();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  changeTheme(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const theme = select.value as Theme;
    this.themeService.setTheme(theme);
    this.currentTheme = theme;
  }
}
