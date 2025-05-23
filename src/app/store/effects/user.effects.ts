import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, catchError, switchMap, tap } from 'rxjs/operators';
import { UsersService } from '../../core/services/users/users.service';
import { UserActions } from '../actions/user.actions';
import { transformViewModelToUser } from '../../core/models/user.model';

@Injectable()
export class UserEffects {
  // Use inject() function for dependency injection
  private actions$ = inject(Actions);
  private usersService = inject(UsersService);

  /**
   * Effect to load users from the API
   * Uses switchMap to cancel previous requests
   * Includes error handling for API failures
   */
  loadUsers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.loadUsers),
      tap(() => console.log('Loading users...')),
      switchMap(() =>
        this.usersService.getUsers().pipe(
          map(users => {
            // Service already returns transformed UserView[]
            return UserActions.loadUsersSuccess({ users });
          }),
          catchError(error => {
            console.error('Error fetching users:', error);
            return of(UserActions.loadUsersFailure({ error }));
          })
        )
      )
    )
  );

  createUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.createUser),
      switchMap(({ user }) =>
        this.usersService.createUser(transformViewModelToUser(user)).pipe(
          map(createdUser => UserActions.createUserSuccess({ user: createdUser })),
          catchError(error => of(UserActions.createUserFailure({ error })))
        )
      )
    )
  );

  updateUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.updateUser),
      switchMap(({ id, user }) =>
        this.usersService.updateUser(id, transformViewModelToUser(user)).pipe(
          map(updatedUser => UserActions.updateUserSuccess({ user: updatedUser })),
          catchError(error => of(UserActions.updateUserFailure({ error })))
        )
      )
    )
  );

  deleteUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.deleteUser),
      switchMap(({ id }) =>
        this.usersService.deleteUser(id).pipe(
          map(() => UserActions.deleteUserSuccess({ id })),
          catchError(error => of(UserActions.deleteUserFailure({ error })))
        )
      )
    )
  );
}
