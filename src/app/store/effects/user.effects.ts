import { Injectable, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { selectUserLastLoaded } from '../selectors/user.selectors';
import { selectUser } from '../selectors/auth.selectors';
import { of } from 'rxjs';
import { catchError, map, withLatestFrom, mergeMap, switchMap, tap } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { UserActions } from '../actions/user.actions';
import { UserService } from '../../core/services/user/user.service';
import { ToastService } from '../../core/services/toast/toast.service';

import { User } from '../../core/models/user.model';

@Injectable()
export class UserEffects {
  private actions$ = inject(Actions);
  private userService = inject(UserService);
  private store = inject(Store);
  private toastService = inject(ToastService);

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
        return this.userService.createUser(user).pipe(
          map((createdUser) => UserActions.createUserSuccess({ user: createdUser })),
          catchError((error) => of(UserActions.createUserFailure({ error })))
        );
      })
    )
  );

  updateUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.updateUser),
      mergeMap(({ id, user }) =>
        this.userService.updateUser(String(id), user).pipe(
          map(() => {
            this.toastService.show({ message: 'User updated successfully!', type: 'success' });
            // The `user` from the action is a Partial<User>. We need to cast it to User for the success action.
            // This assumes the backend returns the full updated user, or that the partial update is sufficient for the store.
            return UserActions.updateUserSuccess({ user: { id, ...user } as User });
          }),
          catchError((error) => {
            const errorMessage = error.error?.message || 'Failed to update user. Please try again.';
            this.toastService.show({ message: errorMessage, type: 'error' });
            return of(UserActions.updateUserFailure({ error }));
          })
        )
      )
    )
  );

  deleteUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.deleteUser),
      mergeMap(({ id }) =>
        this.userService.deleteUser(String(id)).pipe(
          map(() => UserActions.deleteUserSuccess({ id })),
          catchError((error) => of(UserActions.deleteUserFailure({ error })))
        )
      )
    )
  );

  updateMe$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.updateMe),
      withLatestFrom(this.store.select(selectUser)),
      mergeMap(([{ user }, currentUser]) => {
        if (!currentUser) {
          return of(
            UserActions.updateMeFailure({
              error: new HttpErrorResponse({
                error: 'User not found, please re-login',
                status: 401,
                statusText: 'Unauthorized',
              }),
            })
          );
        }

        // If first_name or last_name are being updated, construct the full name.
        if ('first_name' in user || 'last_name' in user) {
          const firstName = user.first_name ?? currentUser.first_name;
          const lastName = user.last_name ?? currentUser.last_name;
          user.name = `${firstName} ${lastName}`.trim();
        }

        console.log('Payload being sent to backend:', user);
        const updatedUser = { ...currentUser, ...user };

        return this.userService.updateMe(user).pipe(
          map(() => UserActions.updateMeSuccess({ user: updatedUser })),
          tap(() => {
            this.toastService.show({ message: 'Profile saved successfully!', type: 'success' });
          }),
          catchError((error) => {
            const errorMessage = error?.error?.message || error?.message || 'Failed to save profile. Please try again.';
            this.toastService.show({ message: errorMessage, type: 'error' });

            // Ensure the error dispatched to the store is an HttpErrorResponse
            const errorResponse =
              error instanceof HttpErrorResponse
                ? error
                : new HttpErrorResponse({ error, status: 0, statusText: 'Client Error' });

            return of(UserActions.updateMeFailure({ error: errorResponse }));
          })
        );
      })
    )
  );
}
