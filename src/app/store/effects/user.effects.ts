import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { UserActions } from '../actions/user.actions';
import { UsersService } from '../../core/services/users/users.service';
import { catchError, map, mergeMap, of, switchMap } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { selectUserState } from '../selectors/user.selectors';
import { withLatestFrom } from 'rxjs/operators';

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
      switchMap(([action, state]) =>
        this.usersService.getUsers(state.filters).pipe(
          map((users) =>
            UserActions.loadUsersSuccess({ users })
          ),
          catchError((error) => of(UserActions.loadUsersFailure({ error })))
        )
      )
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
