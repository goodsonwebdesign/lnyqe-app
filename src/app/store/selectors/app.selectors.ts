import { AppState } from '../reducers/app.reducer';
import { createFeatureSelector, createSelector } from '@ngrx/store';

// Define the AppViewModel interface
export interface AppViewModel {
  isLoading: boolean;
}

// Feature selector for the app state
export const selectAppState = createFeatureSelector<AppState>('app');

// Selector for the global loading state
export const selectAppIsLoading = createSelector(
  selectAppState,
  (state: AppState) => state.isLoading,
);

// Create a unified view model for app state
export const selectAppViewModel = createSelector(
  selectAppIsLoading,
  (isLoading): AppViewModel => ({
    isLoading,
  }),
);
