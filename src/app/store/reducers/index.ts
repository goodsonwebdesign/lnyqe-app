import { appReducer, AppState as GlobalAppState } from './app.reducer';
import { userFeature, UserState } from './user.reducer';
import { isDevMode } from '@angular/core';
import { ActionReducerMap, MetaReducer } from '@ngrx/store';

// Root state interface
export interface AppState {
  app: GlobalAppState;
  users: UserState;
}

// Root reducer
export const reducers: ActionReducerMap<AppState> = {
  app: appReducer,
  users: userFeature.reducer,
};

// Meta-reducers only run in development mode
export const metaReducers: MetaReducer<AppState>[] = isDevMode() ? [] : [];
