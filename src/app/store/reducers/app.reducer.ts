import { createReducer, on } from '@ngrx/store';
import { AppActions } from '../actions/app.actions';

export interface AppState {
  isLoading: boolean;
}

export const initialState: AppState = {
  isLoading: false
};

export const appReducer = createReducer(
  initialState,
  on(AppActions.loadingStarted, state => ({
    ...state,
    isLoading: true
  })),
  on(AppActions.loadingCompleted, state => ({
    ...state,
    isLoading: false
  }))
);