import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { User } from '../../core/models/user.model';

export const UserActions = createActionGroup({
  source: 'User',
  events: {
    // Load Users
    'Load Users': emptyProps(),
    'Load Users No Op': emptyProps(),
    'Load Users Success': props<{ users: User[] }>(),
    'Load Users Failure': props<{ error: unknown }>(),

    // Create User
    'Create User': props<{ user: Partial<User> }>(),
    'Create User Success': props<{ user: User }>(),
    'Create User Failure': props<{ error: unknown }>(),

    // Update User
    'Update User': props<{ id: number; user: Partial<User> }>(),
    'Update User Success': props<{ user: User }>(),
    'Update User Failure': props<{ error: unknown }>(),

    // Update Me
    'Update Me': props<{ user: Partial<User> }>(),
    'Update Me Success': props<{ user: User }>(),
    'Update Me Failure': props<{ error: unknown }>(),

    // Delete User
    'Delete User': props<{ id: number }>(),
    'Delete User Success': props<{ id: number }>(),
    'Delete User Failure': props<{ error: unknown }>(),

    // Select User
    'Select User': props<{ id: number }>(),
    'Clear Selected User': emptyProps(),

    // Set Filters
    'Set User Filters': props<{ filters: Partial<User> }>(),

    // Reset State
    'Reset User State': emptyProps(),
  },
});

// For backward compatibility during migration
export const loadUsers = UserActions.loadUsers;
export const loadUsersSuccess = UserActions.loadUsersSuccess;
export const loadUsersFailure = UserActions.loadUsersFailure;
