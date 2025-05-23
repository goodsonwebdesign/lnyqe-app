import { isDevMode } from '@angular/core';
import { ActionReducerMap, MetaReducer } from '@ngrx/store';
import { AuthState, authReducer } from './auth.reducer';
import { AppState as GlobalAppState, appReducer } from './app.reducer';
import { UserState } from './user.reducer';
import { userFeature } from './user.reducer';

// Root state interface
export interface AppState {
  auth: AuthState;
  app: GlobalAppState;
  users: UserState; // Changed from user to users to match feature name
}

// Root reducer
export const reducers: ActionReducerMap<AppState> = {
  auth: authReducer,
  app: appReducer,
  users: userFeature.reducer, // Changed from user to users to match feature name
};

// Meta-reducers only run in development mode
export const metaReducers: MetaReducer<AppState>[] = isDevMode() ? [] : [];
