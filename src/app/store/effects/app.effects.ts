import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { tap } from 'rxjs/operators';
import { appLoaded, appLoading } from '../actions/app.actions';
import { AuthActions } from '../actions/auth.actions';
import { ROUTER_NAVIGATION, ROUTER_REQUEST } from '@ngrx/router-store';

@Injectable()
export class AppEffects {
  private actions$ = inject(Actions);
  private store = inject(Store);

  // Show loading state when login starts
  loginRequest$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loginRequest),
        tap(() => this.store.dispatch(appLoading())),
      ),
    { dispatch: false },
  );

  // Clear loading state when login completes (success or failure)
  loginComplete$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loginSuccess, AuthActions.loginFailure),
        tap(() => this.store.dispatch(appLoaded())),
      ),
    { dispatch: false },
  );

  // Show loading state during route changes
  routerRequest$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(ROUTER_REQUEST),
        tap(() => this.store.dispatch(appLoading())),
      ),
    { dispatch: false },
  );

  // Clear loading state after route changes
  routerNavigation$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(ROUTER_NAVIGATION),
        tap(() => this.store.dispatch(appLoaded())),
      ),
    { dispatch: false },
  );
}
