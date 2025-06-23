import { createSelector } from '@ngrx/store';

import { AuthToken } from '../../core/models/auth.model';
import { User } from '../../core/models/user.model';
import {
  selectIsAuthenticated,
  selectUser,
  selectToken,
  selectIsLoading,
  selectError,
  selectOrganizationId,
  selectIsEnterpriseSSOEnabled,
} from '../reducers/auth.reducer';

// Re-exporting for global use
export {
  selectIsAuthenticated,
  selectUser,
  selectToken,
  selectIsLoading,
  selectError,
  selectOrganizationId,
  selectIsEnterpriseSSOEnabled,
};

// Aliases for consistency
export const selectCurrentUser = selectUser;
export const selectAuthToken = selectToken;
export const selectAuthLoading = selectIsLoading;

export const selectUserRole = createSelector(selectUser, (user: User | null) => user?.role || null);

// Create a unified view model
export interface AuthViewModel {
  isAuthenticated: boolean;
  user: User | null;
  token: AuthToken | null;
  isLoading: boolean;
  error: string | null;
  organizationId: string | null;
  isEnterpriseSSOEnabled: boolean;
  role: string | null;
}

export const selectAuthViewModel = createSelector(
  selectIsAuthenticated,
  selectUser,
  selectToken,
  selectIsLoading,
  selectError,
  selectOrganizationId,
  selectIsEnterpriseSSOEnabled,
  selectUserRole,
  (
    isAuthenticated,
    user,
    token,
    isLoading,
    error,
    organizationId,
    isEnterpriseSSOEnabled,
    role
  ): AuthViewModel => ({
    isAuthenticated,
    user,
    token,
    isLoading,
    error,
    organizationId,
    isEnterpriseSSOEnabled,
    role,
  })
);
