import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { selectUserLastLoaded } from '../selectors/user.selectors';
import { of } from 'rxjs';
import { catchError, map, withLatestFrom, mergeMap, switchMap } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { UserActions } from '../actions/user.actions';
import { UserService } from '../../core/services/user/user.service';
import { transformViewModelToUser } from '../../core/models/user.model';

@Injectable()
export class UserEffects {
  private actions$ = inject(Actions);
  private userService = inject(UserService);
  private store = inject(Store);

  loadUsers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.loadUsers),
      withLatestFrom(this.store.select(selectUserLastLoaded)),
      switchMap(([, lastLoaded]) => {
        // Fetch if data has never been loaded or is older than 5 minutes
        if (!lastLoaded || Date.now() - lastLoaded.getTime() > 5 * 60 * 1000) {
          return this.userService.getUsers().pipe(
            map((users) => UserActions.loadUsersSuccess({ users })),
            catchError((error) => of(UserActions.loadUsersFailure({ error })))
          );
        } else {
          // Data is fresh, so dispatch a no-op action to stop the loading indicator
          return of(UserActions.loadUsersNoOp());
        }
      })
    )
  );

  createUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.createUser),
      mergeMap(({ user }) => {
        const userPayload = transformViewModelToUser(user);
        return this.userService.createUser(userPayload).pipe(
          map((createdUser) => UserActions.createUserSuccess({ user: createdUser })),
          catchError((error) => of(UserActions.createUserFailure({ error })))
        );
      })
    )
  );

  updateUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.updateUser),
      mergeMap(({ id, user }) => {
        const userPayload = transformViewModelToUser(user);
        return this.userService.updateUser(id, userPayload).pipe(
          map((updatedUser) => UserActions.updateUserSuccess({ user: updatedUser })),
          catchError((error) => of(UserActions.updateUserFailure({ error })))
        );
      })
    )
  );

  deleteUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.deleteUser),
      mergeMap(({ id }) =>
        this.userService.deleteUser(id).pipe(
          map(() => UserActions.deleteUserSuccess({ id })),
          catchError((error) => of(UserActions.deleteUserFailure({ error })))
        )
      )
    )
  );
}
