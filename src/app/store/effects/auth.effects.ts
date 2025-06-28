import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { AuthService as Auth0Service } from '@auth0/auth0-angular';
import { of } from 'rxjs';
import { concatLatestFrom } from '@ngrx/operators';
import { catchError, filter, map, switchMap, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/services/auth/auth.service';
import { UserService } from '../../core/services/user/user.service';
import { AuthActions } from '../actions/auth.actions';
import { selectIsAuthenticated } from '../reducers/auth.reducer';

@Injectable()
export class AuthEffects {
  private actions$ = inject(Actions);
  private auth0 = inject(Auth0Service);
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private store = inject(Store);
  private router = inject(Router);

  initAuth$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.initAuth),
      // Don't run on the callback route, as the SDK is still processing
      filter(() => !this.router.url.includes('/callback')),
      tap(() => this.store.dispatch(AuthActions.authCheckStart())),
      switchMap(() => this.auth0.isAuthenticated$),
      map((isAuthenticated) => {
        if (isAuthenticated) {
          return AuthActions.checkAuth();
        } else {
          return AuthActions.authCheckEnd();
        }
      })
    )
  );

  checkAuth$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.checkAuth),
      switchMap(() =>
        this.authService.getFreshToken$().pipe(
          map((token) => AuthActions.setAuthToken({ token })),
          catchError((error) => {
            console.error('[AuthEffects] checkAuth$: getFreshToken$ failed', error);
            return of(AuthActions.logout());
          })
        )
      )
    )
  );

  fetchUserProfile$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.setAuthToken),
      concatLatestFrom(() => this.store.select(selectIsAuthenticated)),
      filter(([, isAuthenticated]) => isAuthenticated),
      switchMap(() =>
        this.userService.getMe().pipe(
          map((user) => AuthActions.loginSuccess({ payload: { user } })),
          catchError((error) => {
            console.error('[AuthEffects] fetchUserProfile$: getMe failed', error);
            return of(AuthActions.logout());
          })
        )
      )
    )
  );

  loginRequest$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loginRequest),
        tap(({ organization }) => {
          this.auth0.loginWithRedirect({
            appState: { target: '/dashboard' },
            authorizationParams: {
              scope: 'openid profile email offline_access',
              ...(organization ? { organization } : {}),
            },
          });
        })
      ),
    { dispatch: false }
  );

  loginSuccessRedirect$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loginSuccess),
        tap(() => {
          this.store.dispatch(AuthActions.authCheckEnd());
          this.router.navigate(['/dashboard']);
        })
      ),
    { dispatch: false }
  );

  loginFailure$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loginFailure),
        tap(({ error }) => {
          console.error('Authentication Error:', error);
          this.router.navigate(['/']);
        })
      ),
    { dispatch: false }
  );

  logout$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.logout),
        tap(() => {
          this.store.dispatch(AuthActions.authCheckEnd());
          this.router.navigate(['/']);
          this.auth0.logout({
            logoutParams: {
              returnTo: window.location.origin,
              clientId: environment.auth.clientId,
            },
          });
        })
      ),
    { dispatch: false }
  );
}
