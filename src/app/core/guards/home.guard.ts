import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
import { selectIsAuthenticated } from '../../store/selectors/auth.selectors';
import { AuthService } from '../services/auth/auth.service';

/**
 * Home Guard
 *
 * Prevents authenticated users from accessing the home/login page by redirecting them
 * to the dashboard. This guard is robust against race conditions by checking both the
 * NgRx store and the Auth0 service for authentication status.
 */
export const homeGuard = () => {
  const store = inject(Store);
  const router = inject(Router);
  const authService = inject(AuthService);

  // First, check the store for authentication status.
  return store.select(selectIsAuthenticated).pipe(
    take(1),
    switchMap(isStoreAuthenticated => {
      if (isStoreAuthenticated) {
        // If the store confirms authentication, redirect to the dashboard immediately.
        return of(router.createUrlTree(['/dashboard']));
      }

      // If the store shows not authenticated, it might be a race condition after login.
      // Double-check directly with the Auth0 service.
      return authService.auth0Service.isAuthenticated$.pipe(
        take(1), // We only need the current status.
        map(isAuth0Authenticated => {
          if (isAuth0Authenticated) {
            // If Auth0 confirms authentication, redirect to the dashboard.
            return router.createUrlTree(['/dashboard']);
          }
          // If both the store and Auth0 confirm no authentication, allow access to the home page.
          return true;
        })
      );
    })
  );
};
