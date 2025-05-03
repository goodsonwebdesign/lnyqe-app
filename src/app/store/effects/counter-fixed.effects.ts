import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { tap } from 'rxjs/operators';
import * as CounterActions from '../actions/counter.actions';

/**
 * Counter effects implementation using a simpler pattern.
 * This implementation uses functional effects, which are easier to work with
 * and have fewer initialization issues.
 */
@Injectable()
export class CounterEffects {
  // Use functional effects pattern - this has fewer initialization issues
  logCounterActions = createEffect(() => 
    this.actions$.pipe(
      ofType(
        CounterActions.increment,
        CounterActions.decrement,
        CounterActions.reset,
        CounterActions.setCount
      ),
      tap(action => console.log('Counter action dispatched:', action))
    ),
    { dispatch: false }
  );

  constructor(private actions$: Actions) {}
}
