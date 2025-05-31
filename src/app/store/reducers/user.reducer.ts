import { createReducer, on } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { UserView } from '../../core/models/user.model';
import { UserActions } from '../actions/user.actions';
import { createFeature } from '@ngrx/store';
import { UserFilters } from '../../features/users-management/users-management.types';

export interface UserState extends EntityState<UserView> {
  loading: boolean;
  error: any;
  selectedUserId: number | null;
  filters: UserFilters;
}

export const userAdapter: EntityAdapter<UserView> = createEntityAdapter<UserView>({
  selectId: (user) => user.id,
  sortComparer: (a, b) => a.first_name.localeCompare(b.first_name),
});

export const initialState: UserState = userAdapter.getInitialState({
  loading: false,
  error: null,
  selectedUserId: null,
  filters: {
    search: '',
    role: '',
    status: '',
    department: '',
    sortBy: 'name',
  },
});

export const userReducer = createReducer(
  initialState,
  on(UserActions.loadUsers, (state) => ({ ...state, loading: true, error: null })),
  on(UserActions.loadUsersSuccess, (state, { users }) => userAdapter.setAll(users, { ...state, loading: false, error: null })),
  on(UserActions.loadUsersFailure, (state, { error }) => ({ ...state, loading: false, error })),

  on(UserActions.createUser, (state) => ({ ...state, loading: true })),
  on(UserActions.createUserSuccess, (state, { user }) => userAdapter.addOne(user, { ...state, loading: false })),
  on(UserActions.createUserFailure, (state, { error }) => ({ ...state, loading: false, error })),

  on(UserActions.updateUser, (state) => ({ ...state, loading: true })),
  on(UserActions.updateUserSuccess, (state, { user }) => userAdapter.upsertOne(user, { ...state, loading: false })),
  on(UserActions.updateUserFailure, (state, { error }) => ({ ...state, loading: false, error })),

  on(UserActions.deleteUser, (state) => ({ ...state, loading: true })),
  on(UserActions.deleteUserSuccess, (state, { id }) => userAdapter.removeOne(id, { ...state, loading: false })),
  on(UserActions.deleteUserFailure, (state, { error }) => ({ ...state, loading: false, error })),

  on(UserActions.selectUser, (state, { id }) => ({ ...state, selectedUserId: id })),
  on(UserActions.clearSelectedUser, (state) => ({ ...state, selectedUserId: null })),
  on(UserActions.setUserFilters, (state, { filters }) => ({
    ...state,
    filters: { ...state.filters, ...filters },
    // Reset to first page on filter change
  })),
);

export const {
  selectAll: selectAllUsers,
  selectEntities: selectUserEntities,
  selectIds: selectUserIds,
  selectTotal: selectUserTotal,
} = userAdapter.getSelectors();

export const userFeature = createFeature({
  name: 'users',
  reducer: userReducer,
});
