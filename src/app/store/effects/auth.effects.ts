import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { AuthService as Auth0Service } from '@auth0/auth0-angular';
import { Store } from '@ngrx/store';
import { of, timer, iif } from 'rxjs';
import { catchError, exhaustMap, map, switchMap, tap, finalize, debounceTime, filter, withLatestFrom } from 'rxjs/operators';
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
    tap(({ organization }) => {
      // Show loading state
      this.store.dispatch(AppActions.appLoading());
      
      // Perform login - Auth0 handles the redirect flow
      this.authService.login(organization);
    })
  ), { dispatch: false });

  // Prevent loops by adding an action progress check
  loginSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(AuthActions.loginSuccess),
    tap(({ user }) => {
      console.log('Login success effect triggered');
      
      // Only proceed if we're not already processing an action
      if (AuthEffects.actionInProgress) {
        console.log('Action already in progress, skipping');
        return;
      }
      
      AuthEffects.actionInProgress = true;
      
      // Hide loading state
      this.store.dispatch(AppActions.appLoaded());
      
      // Log success
      console.log('User authenticated:', user.email);
      
      // Careful with navigation - don't redirect if we're already on the dashboard
      if (window.location.pathname !== '/dashboard') {
        console.log('Redirecting to dashboard');
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
      console.log('Login failure effect triggered');
      
      // Only proceed if we're not already processing an action
      if (AuthEffects.actionInProgress) {
        console.log('Action already in progress, skipping');
        return;
      }
      
      AuthEffects.actionInProgress = true;
      
      // Hide loading state
      this.store.dispatch(AppActions.appLoaded());
      
      // Log error
      console.error('Authentication failed:', error);
      
      // Redirect to home page only if not already there
      if (window.location.pathname !== '/') {
        console.log('Redirecting to home page');
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
    tap(() => {
      console.log('Logout effect triggered');
      
      // Only proceed if we're not already processing an action
      if (AuthEffects.actionInProgress) {
        console.log('Action already in progress, skipping');
        return;
      }
      
      AuthEffects.actionInProgress = true;
      
      // Navigate to home page if not already there
      if (window.location.pathname !== '/') {
        console.log('Redirecting to home from logout');
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

  // Heavily debounce auth check to prevent rapid firing
  checkAuth$ = createEffect(() => this.actions$.pipe(
    ofType(AuthActions.checkAuth),
    debounceTime(500), // Add significant debounce to prevent rapid checks
    filter(() => !AuthEffects.actionInProgress), // Skip if an action is already in progress
    tap(() => {
      console.log('Check auth effect triggered');
      AuthEffects.actionInProgress = true;
    }),
    exhaustMap(() => {
      console.log('Checking auth state');
      return this.auth0Service.isAuthenticated$.pipe(
        switchMap(isAuthenticated => {
          console.log('Auth state check result:', isAuthenticated);
          
          if (isAuthenticated) {
            return this.auth0Service.user$.pipe(
              map(user => {
                if (user) {
                  // Reset the action flag before returning
                  setTimeout(() => {
                    AuthEffects.actionInProgress = false;
                  }, 1000);
                  return AuthActions.loginSuccess({ user });
                }
                // Reset the action flag before returning
                setTimeout(() => {
                  AuthEffects.actionInProgress = false;
                }, 1000);
                return AuthActions.loginFailure({ error: 'User information not available' });
              })
            );
          }
          
          // Reset the action flag before returning
          setTimeout(() => {
            AuthEffects.actionInProgress = false;
          }, 1000);
          return of(AuthActions.loginFailure({ error: 'Not authenticated' }));
        }),
        catchError(error => {
          // Reset the action flag on error
          setTimeout(() => {
            AuthEffects.actionInProgress = false;
          }, 1000);
          return of(AuthActions.loginFailure({ error }));
        })
      );
    })
  ));
}