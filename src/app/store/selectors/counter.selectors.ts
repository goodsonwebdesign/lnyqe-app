import { createFeatureSelector, createSelector } from '@ngrx/store';
import { CounterState } from '../reducers/counter.reducer';

// Feature selector
export const selectCounterState = createFeatureSelector<CounterState>('counter');

// Specific selectors
export const selectCount = createSelector(
  selectCounterState,
  (state: CounterState) => state.count
);
