import { isDevMode } from '@angular/core';
import { ActionReducerMap, MetaReducer } from '@ngrx/store';
import { CounterState, counterReducer } from './counter.reducer';

// Root state interface
export interface AppState {
  counter: CounterState;
}

// Root reducer
export const reducers: ActionReducerMap<AppState> = {
  counter: counterReducer
};

// Meta-reducers only run in development mode
export const metaReducers: MetaReducer<AppState>[] = isDevMode() ? [] : [];