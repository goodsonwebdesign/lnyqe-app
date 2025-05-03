import { isDevMode } from '@angular/core';
import { ActionReducerMap, MetaReducer } from '@ngrx/store';
import { CounterState, counterReducer } from './counter.reducer';
import { AuthState, authReducer } from './auth.reducer';

// Root state interface
export interface AppState {
  counter: CounterState;
  auth: AuthState;
}

// Root reducer
export const reducers: ActionReducerMap<AppState> = {
  counter: counterReducer,
  auth: authReducer
};

// Meta-reducers only run in development mode
export const metaReducers: MetaReducer<AppState>[] = isDevMode() ? [] : [];
