import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { tap } from 'rxjs/operators';
import { appLoaded, appLoading } from '../actions/app.actions';
import { loginFailure, loginRequest, loginSuccess } from '../actions/auth.actions';
import { ROUTER_NAVIGATION, ROUTER_REQUEST } from '@ngrx/router-store';

@Injectable()
export class AppEffects {
  constructor(
    private readonly actions$: Actions,
    private readonly store: Store
  ) {}

  loginRequest$ = createEffect(
    () => this.actions$.pipe(
      ofType(loginRequest),
      tap(() => this.store.dispatch(appLoading()))
    ),
    { dispatch: false }
  );

  loginComplete$ = createEffect(
    () => this.actions$.pipe(
      ofType(loginSuccess, loginFailure),
      tap(() => this.store.dispatch(appLoaded()))
    ),
    { dispatch: false }
  );

  routerRequest$ = createEffect(
    () => this.actions$.pipe(
      ofType(ROUTER_REQUEST),
      tap(() => this.store.dispatch(appLoading()))
    ),
    { dispatch: false }
  );

  routerNavigation$ = createEffect(
    () => this.actions$.pipe(
      ofType(ROUTER_NAVIGATION),
      tap(() => this.store.dispatch(appLoaded()))
    ),
    { dispatch: false }
  );
}