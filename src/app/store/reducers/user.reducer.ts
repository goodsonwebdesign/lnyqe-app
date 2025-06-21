import { createFeature, createReducer, on } from '@ngrx/store';
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { User } from '../../core/models/user.model';
import { UserActions } from '../actions/user.actions';

export interface UserState extends EntityState<User> {
  selectedUserId: number | null;
  loading: boolean;
  error: any;
  lastLoaded: Date | null;
}

export const userAdapter: EntityAdapter<User> = createEntityAdapter<User>({
  selectId: (user: User) => String(user.id), // Normalize ID to string for the adapter
});

export const initialState: UserState = userAdapter.getInitialState({
  selectedUserId: null,
  loading: false,
  error: null,
  lastLoaded: null,
});

export const userFeature = createFeature({
  name: 'users',
  reducer: createReducer(
    initialState,
    on(UserActions.loadUsers, (state) => ({
      ...state,
      loading: true,
      error: null,
    })),
    on(UserActions.loadUsersSuccess, (state, { users }) =>
      userAdapter.setAll(users, {
        ...state,
        loading: false,
        lastLoaded: new Date(),
      })
    ),
    on(UserActions.loadUsersFailure, (state, { error }) => ({
      ...state,
      loading: false,
      error,
    })),
    on(UserActions.selectUser, (state, { id }) => ({
      ...state,
      selectedUserId: id,
    })),
    on(UserActions.clearSelectedUser, (state) => ({
      ...state,
      selectedUserId: null,
    })),
    on(UserActions.createUserSuccess, (state, { user }) =>
      userAdapter.addOne(user, state)
    ),
    on(UserActions.updateUserSuccess, (state, { user }) =>
      userAdapter.updateOne({ id: String(user.id), changes: user }, state)
    ),
    on(UserActions.deleteUserSuccess, (state, { id }) =>
      userAdapter.removeOne(id, state)
    )
  ),
});

export const {
  name,
  reducer,
  selectUsersState,
  selectLoading,
  selectError,
} = userFeature;

