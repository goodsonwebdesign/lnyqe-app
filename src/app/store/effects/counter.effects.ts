import { Injectable } from '@angular/core';
import { Actions, ofType, createEffect } from '@ngrx/effects';
import { tap } from 'rxjs/operators';
import * as CounterActions from '../actions/counter.actions';
import { Observable } from 'rxjs';

@Injectable()
export class CounterEffects {
  constructor(private readonly actions$: Actions) {}

  // Using a property with explicit typing to avoid initialization issues
  readonly logActions$: Observable<any> = createEffect(
    () => this.actions$.pipe(
      ofType(CounterActions.increment, CounterActions.decrement, CounterActions.reset, CounterActions.setCount),
      tap(action => console.log('Action performed:', action))
    ),
    { functional: false, dispatch: false }
  );
}