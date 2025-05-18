import { isDevMode } from '@angular/core';
import { ActionReducerMap, MetaReducer } from '@ngrx/store';
import { AuthState, authReducer } from './auth.reducer';
import { AppState as GlobalAppState, appReducer } from './app.reducer';

// Root state interface
export interface AppState {
  auth: AuthState;
  app: GlobalAppState;
}

// Root reducer
export const reducers: ActionReducerMap<AppState> = {
  auth: authReducer,
  app: appReducer
};

// Meta-reducers only run in development mode
export const metaReducers: MetaReducer<AppState>[] = isDevMode() ? [] : [];
