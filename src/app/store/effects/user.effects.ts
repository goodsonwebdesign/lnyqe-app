import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { catchError, map, switchMap, withLatestFrom } from 'rxjs/operators';
import { UsersService } from '../../core/services/users/users.service';
import { UserActions } from '../actions/user.actions';
import { selectCurrentUser } from '../selectors/auth.selectors';

@Injectable()
export class UserEffects {
  // Use inject() function for dependency injection
  private actions$ = inject(Actions);
  private store = inject(Store);
  private usersService = inject(UsersService);

  /**
   * Effect to load users from the API
   * Uses switchMap to cancel previous requests
   * Includes error handling for API failures
   */
  loadUsers$ = createEffect(() => 
    this.actions$.pipe(
      ofType(UserActions.loadUsers),
      withLatestFrom(this.store.select(selectCurrentUser)),
      switchMap(([_, currentUser]) => {
        // Check if user exists and has the sub property which contains the token
        if (!currentUser || !currentUser.sub) {
          console.error('No authentication token available', currentUser);
          return of(UserActions.loadUsersFailure({ error: 'No authentication token available' }));
        }

        // Use the sub property as the token
        return this.usersService.getUsers(currentUser.sub).pipe(
          map(users => UserActions.loadUsersSuccess({ users })),
          catchError(error => {
            console.error('Error fetching users:', error);
            return of(UserActions.loadUsersFailure({ error }));
          })
        );
      })
    )
  );
}
