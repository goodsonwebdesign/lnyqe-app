import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { map, take } from 'rxjs/operators';
import { selectIsAuthenticated } from '../../store/selectors/auth.selectors';

/**
 * Simple Home Guard
 * 
 * A simplified guard for the home route that redirects authenticated users to dashboard.
 * This guard has been simplified to avoid refresh loops.
 */
export const homeGuard: CanActivateFn = (route, state) => {
  const store = inject(Store);
  const router = inject(Router);

  return store.select(selectIsAuthenticated).pipe(
    take(1),
    map(isAuthenticated => {
      if (isAuthenticated) {
        console.log('User already authenticated, redirecting to dashboard');
        return router.createUrlTree(['/dashboard']);
      }

      // Allow access to home page if not authenticated
      return true;
    })
  );
};
