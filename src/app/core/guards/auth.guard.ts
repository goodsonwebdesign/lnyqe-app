import { selectIsAuthenticated } from '../../store/selectors/auth.selectors';
import { AuthService } from '../services/auth/auth.service';
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap, take, timeout } from 'rxjs/operators';

/**
 * Improved Auth Guard
 *
 * This guard has been enhanced to handle authentication transition states more gracefully.
 * It now checks both the store state and the Auth0 service to determine authentication status,
 * providing more resilient routing protection.
 */
export const authGuard: CanActivateFn = (route, state) => {
  // E2E bypass: If running under Cypress and e2e-auth flag is set, allow access
  if ((window as any).Cypress && localStorage.getItem('e2e-auth') === 'admin') {
    return of(true);
  }

  const store = inject(Store);
  const router = inject(Router);
  const authService = inject(AuthService);
  const targetRoute = state.url;


  // First check the store state (fast)
  return store.select(selectIsAuthenticated).pipe(
    take(1),
    switchMap((isStoreAuthenticated) => {

      if (isStoreAuthenticated) {

        return of(true);
      }

      // If store says not authenticated, double-check with Auth0 service
      // Get auth status directly from Auth0 with a short timeout

      return authService.auth0Service.isAuthenticated$.pipe(
        timeout(1000), // Don't wait too long
        take(1),
        map((isAuth0Authenticated) => {

          if (isAuth0Authenticated) {

            // IMPORTANT: If Auth0 says authenticated but store doesn't,
            // we should probably dispatch checkAuth here to sync the store.
            // For now, just allow access if Auth0 is positive.
            // Consider: store.dispatch(AuthActions.checkAuth());
            return true;
          }

          return router.createUrlTree(['/']); // Should be /login or landing page
        }),
        catchError((err) => {
          console.error('[AuthGuard] Error checking Auth0 service:', err, 'Redirecting to /login.');
          return of(router.createUrlTree(['/'])); // Should be /login or landing page
        }),
      );
    }),
  );
};
