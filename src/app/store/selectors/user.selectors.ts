import { createFeatureSelector, createSelector } from '@ngrx/store';
import { UserState, selectAllUsers } from '../reducers/user.reducer';

// Feature selector for the user state
export const selectUserState = createFeatureSelector<UserState>('users');

// Selector to get all users
export const selectUsers = createSelector(selectUserState, selectAllUsers);

// Selector to get the loading state
export const selectUsersLoading = createSelector(selectUserState, (state) => state.loading);

// Selector to get the error state
export const selectUsersError = createSelector(selectUserState, (state) => state.error);

// Selector to get the selected user ID
export const selectSelectedUserId = createSelector(selectUserState, (state) => state.selectedUserId);

// Selector to get the selected user details
export const selectSelectedUser = createSelector(
  selectUserState,
  (state) => (state.selectedUserId ? state.entities[state.selectedUserId] : null),
);

// ViewModel selector for container/presentational components
export const selectUserViewModel = createSelector(
  selectUsers,
  selectUsersLoading,
  selectUsersError,
  selectSelectedUser,
  (users, loading, error, selectedUser) => ({
    users,
    loading,
    error,
    selectedUser,
  }),
);

// Filters selector
export const selectUsersFilters = createSelector(selectUserState, (state) => state.filters);

// ViewModel selector for users with filters
export const selectUsersViewModel = createSelector(
  selectUsers,
  selectUsersLoading,
  selectUsersError,
  selectUsersFilters,
  (users, loading, error, filters) => ({
    users,
    loading,
    error,
    filters,
  }),
);
