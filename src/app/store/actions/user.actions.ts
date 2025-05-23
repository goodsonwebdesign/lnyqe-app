import { createActionGroup, emptyProps, props } from '@ngrx/store';

export const UserActions = createActionGroup({
  source: 'User',
  events: {
    'Load Users': emptyProps(),
    'Load Users Success': props<{ users: any[] }>(),
    'Load Users Failure': props<{ error: any }>(),
  }
});

// For backward compatibility during migration
export const loadUsers = UserActions.loadUsers;
export const loadUsersSuccess = UserActions.loadUsersSuccess;
export const loadUsersFailure = UserActions.loadUsersFailure;
