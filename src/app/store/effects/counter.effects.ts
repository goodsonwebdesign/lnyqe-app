import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map, tap } from 'rxjs/operators';
import * as CounterActions from '../actions/counter.actions';

@Injectable()
export class CounterEffects {
  constructor(private actions$: Actions) {}

  // A simple effect that logs actions but doesn't dispatch new ones
  logActions$ = createEffect(
    () => this.actions$.pipe(
      ofType(CounterActions.increment, CounterActions.decrement, CounterActions.reset, CounterActions.setCount),
      tap(action => console.log('Action performed:', action))
    ), 
    { dispatch: false }
  );
}
