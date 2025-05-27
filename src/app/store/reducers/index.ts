import { isDevMode } from '@angular/core';
import { ActionReducerMap, MetaReducer } from '@ngrx/store';
import { authReducer } from './auth.reducer';
import { AppState as GlobalAppState, appReducer } from './app.reducer';
import { AuthState } from '../../core/models/auth.model';
import { UserState } from './user.reducer';
import { userFeature } from './user.reducer';

// Root state interface
export interface AppState {
  auth: AuthState;
  app: GlobalAppState;
  users: UserState;
}

// Root reducer
export const reducers: ActionReducerMap<AppState> = {
  auth: authReducer,
  app: appReducer,
  users: userFeature.reducer,
};

// Meta-reducers only run in development mode
export const metaReducers: MetaReducer<AppState>[] = isDevMode() ? [] : [];
