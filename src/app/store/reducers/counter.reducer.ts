import { createReducer, on } from '@ngrx/store';
import * as CounterActions from '../actions/counter.actions';

export interface CounterState {
  count: number;
}

export const initialCounterState: CounterState = {
  count: 0
};

export const counterReducer = createReducer(
  initialCounterState,
  on(CounterActions.increment, state => ({ ...state, count: state.count + 1 })),
  on(CounterActions.decrement, state => ({ ...state, count: state.count - 1 })),
  on(CounterActions.reset, state => ({ ...state, count: 0 })),
  on(CounterActions.setCount, (state, { count }) => ({ ...state, count }))
);
