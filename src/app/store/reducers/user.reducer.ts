import { createFeature, createReducer, on } from '@ngrx/store';
import { UserActions } from '../actions/user.actions';

export interface UserState {
  users: any[];
  loading: boolean;
  error: any | null;
}

export const initialUserState: UserState = {
  users: [],
  loading: false,
  error: null
};

export const userFeature = createFeature({
  name: 'users', // Changed from 'user' to 'users' to match the entity type
  reducer: createReducer(
    initialUserState,

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
    }))
  )
});
