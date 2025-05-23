import { createFeature, createReducer, on } from '@ngrx/store';
import { UserView } from '../../features/users-management/users-management.types';
import { UserActions } from '../actions/user.actions';

export interface UserState {
  users: UserView[];
  selectedUserId: string | null;
  loading: boolean;
  error: any | null;
}

export const initialUserState: UserState = {
  users: [],
  selectedUserId: null,
  loading: false,
  error: null
};

export const userFeature = createFeature({
  name: 'users',
  reducer: createReducer(
    initialUserState,

    // Load Users
    on(UserActions.loadUsers, (state) => ({
      ...state,
      loading: true,
      error: null
    })),

    on(UserActions.loadUsersSuccess, (state, { users }) => ({
      ...state,
      users,
      loading: false,
      error: null
    })),

    on(UserActions.loadUsersFailure, (state, { error }) => ({
      ...state,
      loading: false,
      error
    })),

    // Create User
    on(UserActions.createUser, (state) => ({
      ...state,
      loading: true,
      error: null
    })),

    on(UserActions.createUserSuccess, (state, { user }) => ({
      ...state,
      users: [...state.users, user],
      loading: false,
      error: null
    })),

    on(UserActions.createUserFailure, (state, { error }) => ({
      ...state,
      loading: false,
      error
    })),

    // Update User
    on(UserActions.updateUser, (state) => ({
      ...state,
      loading: true,
      error: null
    })),

    on(UserActions.updateUserSuccess, (state, { user }) => ({
      ...state,
      users: state.users.map(u => u.id === user.id ? user : u),
      loading: false,
      error: null
    })),

    on(UserActions.updateUserFailure, (state, { error }) => ({
      ...state,
      loading: false,
      error
    })),

    // Delete User
    on(UserActions.deleteUser, (state) => ({
      ...state,
      loading: true,
      error: null
    })),

    on(UserActions.deleteUserSuccess, (state, { id }) => ({
      ...state,
      users: state.users.filter(u => u.id !== id),
      loading: false,
      error: null
    })),

    on(UserActions.deleteUserFailure, (state, { error }) => ({
      ...state,
      loading: false,
      error
    })),

    // Select User
    on(UserActions.selectUser, (state, { id }) => ({
      ...state,
      selectedUserId: id
    })),

    on(UserActions.clearSelectedUser, (state) => ({
      ...state,
      selectedUserId: null
    }))
  )
});
