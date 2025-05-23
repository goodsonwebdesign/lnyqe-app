import { Injectable, inject, NgZone } from '@angular/core';
import { AuthService as Auth0Service } from '@auth0/auth0-angular';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { filter, take, distinctUntilChanged } from 'rxjs/operators';
import * as AuthActions from '../../../store/actions/auth.actions';
import { selectIsAuthenticated, selectCurrentUser } from '../../../store/selectors/auth.selectors';
import { User, UserRole } from '../../models/user.model';

/**
 * Simplified Auth Service
 *
 * Handles basic authentication with Auth0
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth0Service = inject(Auth0Service);
  private router = inject(Router);
  private store = inject(Store);
  private ngZone = inject(NgZone);

  // Track if this is the first auth check
  private isInitialAuthCheck = true;

  constructor() {
    console.log('Auth Service initialized');

    // Monitor Auth0 authentication state
    this.auth0Service.isAuthenticated$.pipe(
      filter(isAuthenticated => isAuthenticated !== undefined),
      distinctUntilChanged()
    ).subscribe(isAuthenticated => {
      console.log('Auth state:', isAuthenticated);

      if (isAuthenticated) {
        // User is logged in, get user info
        this.auth0Service.user$.pipe(
          filter(user => !!user),
          take(1)
        ).subscribe(user => {
          console.log('User authenticated:', user?.email);
          this.store.dispatch(AuthActions.loginSuccess({ user }));
        });

        this.isInitialAuthCheck = false;
      } else {
        // Handle unauthenticated state
        if (!this.isInitialAuthCheck) {
          this.store.dispatch(AuthActions.logout());
        } else {
          this.store.dispatch(AuthActions.setAuthState({ isAuthenticated: false }));
          this.isInitialAuthCheck = false;
        }
      }
    });
  }

  /**
   * Log in user via Auth0
   */
  login(organization?: string): void {
    console.log('Redirecting to Auth0 login page...');

    // Use NgZone to ensure the redirect happens properly
    this.ngZone.run(() => {
      this.auth0Service.loginWithRedirect({
        appState: { target: '/dashboard' },
        authorizationParams: organization ? { organization } : undefined
      });
    });
  }

  /**
   * Log out user
   */
  logout(): void {
    this.store.dispatch(AuthActions.logout());

    this.auth0Service.logout({
      logoutParams: {
        returnTo: window.location.origin,
        clientId: 'jaxCqNsBtZmpnpbjXBsAzYkhygDKg4TM'
      }
    });
  }

  /**
   * Get the current user
   */
  getUser(): Observable<any> {
    return this.store.select(selectCurrentUser);
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): Observable<boolean> {
    return this.store.select(selectIsAuthenticated);
  }

  /**
   * Process Auth0 user data into our User model
   */
  processUserProfile(auth0User: any): User {
    if (!auth0User) {
      throw new Error('No user data available');
    }

    return {
      id: auth0User.sub,
      email: auth0User.email,
      first_name: auth0User.given_name || '',
      last_name: auth0User.family_name || '',
      avatar: auth0User.picture,
      emailVerified: auth0User.email_verified,
      created_at: new Date().toISOString(),
      role: this.determineUserRole(auth0User),
      status: 'active',
      department: auth0User?.['https://lnyqe.io/department'] || '',
      jobTitle: auth0User?.['https://lnyqe.io/job_title'] || '',
      employeeId: auth0User?.['https://lnyqe.io/employee_id'] || '',
      location: auth0User?.['https://lnyqe.io/location'] || '',
      organizationId: auth0User?.org_id || '',
      usesSSO: !!auth0User?.org_id
    };
  }

  /**
   * Simple role determination
   */
  private determineUserRole(auth0User: any): UserRole {
    const roles = auth0User?.['https://lnyqe.io/roles'] || [];

    if (roles.includes('admin')) {
      return UserRole.ADMIN;
    } else if (roles.includes('facility_manager')) {
      return UserRole.FACILITY_MANAGER;
    } else if (roles.includes('staff')) {
      return UserRole.STAFF;
    } else {
      return UserRole.GUEST;
    }
  }
}
