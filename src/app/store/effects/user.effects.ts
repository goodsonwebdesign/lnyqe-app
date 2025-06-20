import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { UserActions } from '../actions/user.actions';
import { UsersService } from '../../core/services/users/users.service';
import { of, EMPTY } from 'rxjs';
import { catchError, map, withLatestFrom, mergeMap, concatMap } from 'rxjs/operators';
import { Store, select, Action } from '@ngrx/store';
import { selectUserState } from '../selectors/user.selectors';
import { UserState } from '../reducers/user.reducer'; // Import UserState

@Injectable()
export class UserEffects {
  // Use functional injection pattern
  private actions$ = inject(Actions);
  private usersService = inject(UsersService);
  private store = inject(Store);

  loadUsers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.loadUsers, UserActions.setUserFilters),
      withLatestFrom(this.store.pipe(select(selectUserState))),
      concatMap(([action, state]: [Action, UserState]) => {
        // Check if this is a filter action and if users are already loaded
        if (
          action.type === UserActions.setUserFilters.type &&
          state.ids && 
          (state.ids as Array<string | number>).length > 0
        ) {
          // Users are loaded and it's a filter change, so don't call API.
          return EMPTY;
        }

        // Proceed to fetch users if initial load or if users aren't loaded yet
        return this.usersService.getUsers(state.filters).pipe(
          map(users => UserActions.loadUsersSuccess({ users })),
          catchError(error => of(UserActions.loadUsersFailure({ error })))
        );
      })
    )
  );

  createUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.createUser),
      mergeMap(({ user }) =>
        this.usersService.createUser(user).pipe(
          map((created) => UserActions.createUserSuccess({ user: created })),
          catchError((error) => of(UserActions.createUserFailure({ error })))
        )
      )
    )
  );

  updateUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.updateUser),
      mergeMap(({ id, user }) =>
        this.usersService.updateUser(id, user).pipe(
          map((updated) => UserActions.updateUserSuccess({ user: updated })),
          catchError((error) => of(UserActions.updateUserFailure({ error })))
        )
      )
    )
  );

  deleteUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.deleteUser),
      mergeMap(({ id }) =>
        this.usersService.deleteUser(id).pipe(
          map(() => UserActions.deleteUserSuccess({ id })),
          catchError((error) => of(UserActions.deleteUserFailure({ error })))
        )
      )
    )
  );
}
