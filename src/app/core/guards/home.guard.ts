import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../services/auth/auth.service';

/**
 * @description Prevents authenticated users from accessing pages like home or login.
 * If the user is authenticated, it redirects them to the dashboard.
 */
export const homeGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isAuthenticated$.pipe(
    take(1),
    map((isAuthenticated) => {
      if (isAuthenticated) {
        // If authenticated, redirect them to the dashboard.
        return router.createUrlTree(['/dashboard']);
      }

      // If not authenticated, allow access to the route.
      return true;
    })
  );
};
