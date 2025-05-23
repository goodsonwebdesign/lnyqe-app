import { createSelector } from '@ngrx/store';
import { userFeature } from '../reducers/user.reducer';

// Export all the selectors from the feature
export const {
  selectUsersState, // Changed from selectUserState to selectUsersState
  selectUsers,
  selectLoading,
  selectError
} = userFeature;

// Create a UserViewModel interface for components
export interface UserViewModel {
  users: any[];
  loading: boolean;
  error: any | null;
}

// Create a selector for components to consume
export const selectUserViewModel = createSelector(
  selectUsers,
  selectLoading,
  selectError,
  (users, loading, error): UserViewModel => ({
    users,
    loading,
    error
  })
);
