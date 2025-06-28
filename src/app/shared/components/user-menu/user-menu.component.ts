import { Component, OnInit, OnDestroy, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';

import { selectIsAuthenticated, selectCurrentUser } from '../../../store/selectors/auth.selectors';
import { IconComponent } from '../ui/icon/icon.component';
import { User } from '../../../core/models/user.model';
import { AuthActions } from '../../../store/actions/auth.actions';

@Component({
  selector: 'app-user-menu',
  standalone: true,
  imports: [CommonModule, RouterModule, IconComponent],
  templateUrl: './user-menu.component.html',
  styleUrls: ['./user-menu.component.scss'],
})
export class UserMenuComponent implements OnInit, OnDestroy {
  @Output() loginClick = new EventEmitter<void>();

  isMenuOpen = false;
  user: User | null = null;
  isLoggedIn = false;

  private store = inject(Store);

  private subscriptions = new Subscription();

  ngOnInit(): void {
    // Subscribe to authentication state from the store
    this.subscriptions.add(
      this.store.select(selectIsAuthenticated).subscribe((isAuthenticated) => {
        this.isLoggedIn = isAuthenticated;
      })
    );

    // Subscribe to user data from the store
    this.subscriptions.add(
      this.store.select(selectCurrentUser).subscribe((user) => {
        this.user = user;
      })
    );
  }

  ngOnDestroy(): void {
    // Clean up subscriptions when component is destroyed
    this.subscriptions.unsubscribe();
  }

  // Toggle dropdown menu
  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  // Close dropdown when clicking outside
  closeMenu(): void {
    this.isMenuOpen = false;
  }

  // Login method - dispatches login action
  login(): void {
    this.store.dispatch(AuthActions.loginRequest({}));
    this.closeMenu();
    this.loginClick.emit();
  }

  // Logout method - dispatches logout action
  logout(): void {
    this.store.dispatch(AuthActions.logout());
    this.closeMenu();
  }

  // Get user initials for avatar
  getUserInitials(): string {
    if (!this.user || !this.user.name) return 'U';

    const nameParts = this.user.name.split(' ');
    if (nameParts.length > 1) {
      return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
    }

    return nameParts[0].substring(0, 2).toUpperCase();
  }
}
