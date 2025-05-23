import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { User } from '../../core/models/user.model';
import { UserView } from '../../features/users-management/users-management.types';

export const UserActions = createActionGroup({
  source: 'User',
  events: {
    // Load Users
    'Load Users': emptyProps(),
    'Load Users Success': props<{ users: UserView[] }>(),
    'Load Users Failure': props<{ error: any }>(),

    // Create User
    'Create User': props<{ user: Partial<UserView> }>(),
    'Create User Success': props<{ user: UserView }>(),
    'Create User Failure': props<{ error: any }>(),

    // Update User
    'Update User': props<{ id: string; user: Partial<UserView> }>(),
    'Update User Success': props<{ user: UserView }>(),
    'Update User Failure': props<{ error: any }>(),

    // Delete User
    'Delete User': props<{ id: string }>(),
    'Delete User Success': props<{ id: string }>(),
    'Delete User Failure': props<{ error: any }>(),

    // Select User
    'Select User': props<{ id: string }>(),
    'Clear Selected User': emptyProps()
  }
});

// For backward compatibility during migration
export const loadUsers = UserActions.loadUsers;
export const loadUsersSuccess = UserActions.loadUsersSuccess;
export const loadUsersFailure = UserActions.loadUsersFailure;
