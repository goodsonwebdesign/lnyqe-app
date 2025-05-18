import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { map, take } from 'rxjs/operators';
import { selectIsAuthenticated } from '../../store/selectors/auth.selectors';

/**
 * Simple Auth Guard
 * 
 * A simplified authentication guard for protected routes.
 * It only checks if the user is authenticated without complex redirect handling.
 */
export const authGuard: CanActivateFn = (route, state) => {
  const store = inject(Store);
  const router = inject(Router);

  // Simple, direct auth check
  return store.select(selectIsAuthenticated).pipe(
    take(1),
    map(isAuthenticated => {
      if (isAuthenticated) {
        return true;
      }
      
      console.log('User not authenticated, redirecting to home');
      return router.createUrlTree(['/']);
    })
  );
};