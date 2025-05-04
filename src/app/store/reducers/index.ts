import { isDevMode } from '@angular/core';
import { ActionReducerMap, MetaReducer } from '@ngrx/store';
import { AuthState, authReducer } from './auth.reducer';

// Root state interface
export interface AppState {
  auth: AuthState;
}

// Root reducer
export const reducers: ActionReducerMap<AppState> = {
  auth: authReducer
};

// Meta-reducers only run in development mode
export const metaReducers: MetaReducer<AppState>[] = isDevMode() ? [] : [];
