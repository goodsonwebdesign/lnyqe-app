import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../services/auth/auth.service';

/**
 * @description Protects routes that require authentication.
 * It checks the authentication state via the AuthService and redirects to the
 * home page if the user is not authenticated.
 */
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isAuthenticated$.pipe(
    take(1),
    map((isAuthenticated) => {
      if (isAuthenticated) {
        return true;
      }

      // Redirect to the login page if not authenticated.
      return router.createUrlTree(['/']);
    })
  );
};
