import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { User, UserView } from '../../core/models/user.model';
import { HttpErrorResponse } from '@angular/common/http';

export const UserActions = createActionGroup({
  source: 'User',
  events: {
    // Load Users
    'Load Users': emptyProps(),
    'Load Users No Op': emptyProps(),
    'Load Users Success': props<{ users: User[] }>(),
    'Load Users Failure': props<{ error: HttpErrorResponse }>(),

    // Create User
    'Create User': props<{ user: Partial<UserView> }>(),
    'Create User Success': props<{ user: User }>(),
    'Create User Failure': props<{ error: HttpErrorResponse }>(),

    // Update User
    'Update User': props<{ id: number; user: Partial<UserView> }>(),
    'Update User Success': props<{ user: User }>(),
    'Update User Failure': props<{ error: HttpErrorResponse }>(),

    // Delete User
    'Delete User': props<{ id: number }>(),
    'Delete User Success': props<{ id: number }>(),
    'Delete User Failure': props<{ error: HttpErrorResponse }>(),

    // Select User
    'Select User': props<{ id: number }>(),
    'Clear Selected User': emptyProps(),

    // Set Filters
    'Set User Filters': props<{ filters: Partial<UserView> }>(),

    // Reset State
    'Reset User State': emptyProps(),
  },
});

// For backward compatibility during migration
export const loadUsers = UserActions.loadUsers;
export const loadUsersSuccess = UserActions.loadUsersSuccess;
export const loadUsersFailure = UserActions.loadUsersFailure;
