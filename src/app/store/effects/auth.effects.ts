import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { AuthService as Auth0Service } from '@auth0/auth0-angular';
import { Store } from '@ngrx/store';
import { of, timer, iif, from } from 'rxjs';
import { catchError, exhaustMap, map, switchMap, tap, finalize, debounceTime, filter } from 'rxjs/operators';
import { AuthActions } from '../actions/auth.actions';
import * as AppActions from '../actions/app.actions';
import { AuthService } from '../../core/services/auth/auth.service';
import { selectIsAuthenticated } from '../selectors/auth.selectors';

@Injectable()
export class AuthEffects {
  private actions$ = inject(Actions);
  private auth0Service = inject(Auth0Service);
  private authService = inject(AuthService);
  private router = inject(Router);
  private store = inject(Store);

  // Add a flag to prevent loops
  private static actionInProgress = false;

  login$ = createEffect(() => this.actions$.pipe(
    ofType(AuthActions.loginRequest),
    filter(() => !AuthEffects.actionInProgress),
    tap(({ organization }) => {
      AuthEffects.actionInProgress = true;
      // Show loading state
      this.store.dispatch(AppActions.appLoading());

      // Perform login - Auth0 handles the redirect flow
      this.authService.login(organization);
    })
  ), { dispatch: false });

  loginSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(AuthActions.loginSuccess),
    tap(({ user }) => {
      if (AuthEffects.actionInProgress) {
        return;
      }

      AuthEffects.actionInProgress = true;
      // Hide loading state
      this.store.dispatch(AppActions.appLoaded());

      // Log success
      console.log('User authenticated:', user.email);

      // Careful with navigation - don't redirect if we're already on the dashboard
      if (window.location.pathname !== '/dashboard') {
        this.router.navigate(['/dashboard']);
      }

      // Reset the action flag after a short delay
      setTimeout(() => {
        AuthEffects.actionInProgress = false;
      }, 1000);
    })
  ), { dispatch: false });

  loginFailure$ = createEffect(() => this.actions$.pipe(
    ofType(AuthActions.loginFailure),
    tap(({ error }) => {
      if (AuthEffects.actionInProgress) {
        return;
      }

      AuthEffects.actionInProgress = true;
      // Hide loading state
      this.store.dispatch(AppActions.appLoaded());
      // Log error
      console.error('Authentication failed:', error);

      // Redirect to home page only if not already there
      if (window.location.pathname !== '/') {
        this.router.navigate(['/']);
      }

      // Reset the action flag after a short delay
      setTimeout(() => {
        AuthEffects.actionInProgress = false;
      }, 1000);
    })
  ), { dispatch: false });

  logout$ = createEffect(() => this.actions$.pipe(
    ofType(AuthActions.logout),
    filter(() => !AuthEffects.actionInProgress),
    tap(() => {
      AuthEffects.actionInProgress = true;

      // Navigate to home page if not already there
      if (window.location.pathname !== '/') {
        this.router.navigate(['/']);
      }

      // Perform Auth0 logout
      this.auth0Service.logout({
        logoutParams: {
          returnTo: window.location.origin,
          clientId: 'jaxCqNsBtZmpnpbjXBsAzYkhygDKg4TM'
        }
      });

      // Reset the action flag after a short delay
      setTimeout(() => {
        AuthEffects.actionInProgress = false;
      }, 1000);
    })
  ), { dispatch: false });

  refreshToken$ = createEffect(() => this.actions$.pipe(
    ofType(AuthActions.refreshToken),
    filter(() => !AuthEffects.actionInProgress),
    tap(() => {
      AuthEffects.actionInProgress = true;
    }),
    exhaustMap(() =>
      from(this.authService.getTokenSilently()).pipe(
        map(token => AuthActions.refreshTokenSuccess({ token })),
        catchError(error => of(AuthActions.refreshTokenFailure({ error }))),
        finalize(() => {
          AuthEffects.actionInProgress = false;
        })
      )
    )
  ));

  checkAuth$ = createEffect(() => this.actions$.pipe(
    ofType(AuthActions.checkAuth),
    debounceTime(500),
    filter(() => !AuthEffects.actionInProgress),
    tap(() => {
      AuthEffects.actionInProgress = true;
    }),
    exhaustMap(() => {
      console.log('Checking auth state');
      return this.auth0Service.isAuthenticated$.pipe(
        switchMap(isAuthenticated => {
          console.log('Auth state check result:', isAuthenticated);

          if (isAuthenticated) {
            return this.auth0Service.user$.pipe(
              switchMap(user => {
                if (user) {
                  return from(this.authService.getTokenSilently()).pipe(
                    map(token => {
                      const processedUser = this.authService.processUserProfile(user);
                      return AuthActions.loginSuccess({ user: processedUser, token });
                    })
                  );
                }
                return of(AuthActions.loginFailure({ error: 'User information not available' }));
              })
            );
          }

          return of(AuthActions.loginFailure({ error: 'Not authenticated' }));
        }),
        catchError(error => {
          setTimeout(() => {
            AuthEffects.actionInProgress = false;
          }, 1000);
          return of(AuthActions.loginFailure({ error }));
        }),
        finalize(() => {
          setTimeout(() => {
            AuthEffects.actionInProgress = false;
          }, 1000);
        })
      );
    })
  ));
}
