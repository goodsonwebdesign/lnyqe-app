import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { AuthService as Auth0Service } from '@auth0/auth0-angular';
import { Store } from '@ngrx/store';
import { of, timer, iif, from } from 'rxjs';
import {
  catchError,
  exhaustMap,
  map,
  switchMap,
  tap,
  finalize,
  debounceTime,
  filter,
} from 'rxjs/operators';
import { AuthActions } from '../actions/auth.actions';
import * as AppActions from '../actions/app.actions';
import { AuthService } from '../../core/services/auth/auth.service';
import { UserService } from '../../core/services/user/user.service';
import { User } from '../../core/models/user.model';
import { environment } from '../../../environments/environment';

import { selectIsAuthenticated } from '../selectors/auth.selectors';

@Injectable()
export class AuthEffects {
  private actions$ = inject(Actions);
  private auth0Service = inject(Auth0Service);
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private router = inject(Router);
  private store = inject(Store);

  // Add a flag to prevent loops
  private static actionInProgress = false;

  login$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loginRequest),
        filter(() => !AuthEffects.actionInProgress),
        tap(({ organization }) => {
          AuthEffects.actionInProgress = true;
          // Show loading state
          this.store.dispatch(AppActions.appLoading());

          // Perform login - Auth0 handles the redirect flow
          this.authService.login(organization);
        }),
      ),
    { dispatch: false },
  );

  loginSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loginSuccess),

        tap(({ user }) => {
          // Removed the initial check for AuthEffects.actionInProgress to ensure navigation logic always runs on loginSuccess.
          // The actionInProgress flag is still set here to signal to other effects that a login process is active.
          AuthEffects.actionInProgress = true;
          
          // Hide loading state, typically set by checkAuth$
          this.store.dispatch(AppActions.appLoaded());

          // Careful with navigation - don't redirect if we're already on the dashboard

                    if (!window.location.pathname.startsWith('/dashboard')) {

            this.router.navigate(['/dashboard']);
          } else {

          }

          // Reset the action flag after a short delay
          setTimeout(() => {
            AuthEffects.actionInProgress = false;
          }, 1000);
        }),
      ),
    { dispatch: false },
  );

  loginFailure$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loginFailure),
        tap(({ error }) => {
          if (AuthEffects.actionInProgress) {
            return;
          }

          AuthEffects.actionInProgress = true;
          // Hide loading state
          this.store.dispatch(AppActions.appLoaded());

          // Redirect to home page only if not already there
          if (window.location.pathname !== '/') {
            this.router.navigate(['/']);
          }

          // Reset the action flag after a short delay
          setTimeout(() => {
            AuthEffects.actionInProgress = false;
          }, 1000);
        }),
      ),
    { dispatch: false },
  );

  logout$ = createEffect(
    () =>
      this.actions$.pipe(
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
              clientId: environment.auth.clientId,
            },
          });

          // Reset the action flag after a short delay
          setTimeout(() => {
            AuthEffects.actionInProgress = false;
          }, 1000);
        }),
      ),
    { dispatch: false },
  );

  checkAuth$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.checkAuth),
      tap(() => this.store.dispatch(AppActions.appLoading())), // Dispatch appLoading
      exhaustMap(() => {
        return this.auth0Service.isAuthenticated$.pipe(
          switchMap((isAuthenticated) => {
            if (isAuthenticated) {
              return this.auth0Service.user$.pipe(
                switchMap((auth0User) => {
                  if (auth0User) {
                    return from(this.authService.getTokenSilently()).pipe(
                      switchMap((token) => {
                        return this.userService.getMe().pipe(
                          tap(() => {
                            AuthEffects.actionInProgress = false;

                          }),
                          map((backendUser: User) => {
                            if (!backendUser) {
                              throw new Error('Backend user profile is missing or undefined.');
                            }

                            return AuthActions.loginSuccess({ user: backendUser, token });
                          }),
                          catchError((getMeError) => {
                            return of(AuthActions.loginFailure({ error: `Failed to fetch backend user: ${getMeError.message}` }));
                          })
                        );
                      }),
                      catchError((tokenError) => {
                        return of(AuthActions.loginFailure({ error: `Failed to get API token: ${tokenError.message}` }));
                      })
                    );
                  }
                  return of(AuthActions.loginFailure({ error: 'Auth0 user information not available' }));
                }),
                catchError((userError) => {
                  return of(AuthActions.loginFailure({ error: `Failed to get Auth0 user: ${userError.message}` }));
                })
              );
            }
            return of(AuthActions.loginFailure({ error: 'Not authenticated' }));
          }),
          catchError((authCheckError) => {
            AuthEffects.actionInProgress = false; // Reset flag immediately on error
            return of(AuthActions.loginFailure({ error: `Authentication check failed: ${authCheckError.message}` }));
          }),
          finalize(() => {
            AuthEffects.actionInProgress = false;
            this.store.dispatch(AppActions.appLoaded()); // Dispatch appLoaded
          })
        );
      })
    )
  );
}
