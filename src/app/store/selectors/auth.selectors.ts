import { AuthState, AuthToken } from '../../core/models/auth.model';
import { User } from '../../core/models/user.model';
import { createFeatureSelector, createSelector } from '@ngrx/store';

// Feature selector
export const selectAuthState = createFeatureSelector<AuthState>('auth');

// Individual selectors
export const selectIsAuthenticated = createSelector(
  selectAuthState,
  (state: AuthState) => state.isAuthenticated,
);

export const selectCurrentUser = createSelector(selectAuthState, (state: AuthState) => state.user);

export const selectAuthToken = createSelector(selectAuthState, (state: AuthState) => state.token);

export const selectAuthLoading = createSelector(
  selectAuthState,
  (state: AuthState) => state.isLoading,
);

export const selectAuthError = createSelector(selectAuthState, (state: AuthState) => state.error);

export const selectOrganizationId = createSelector(
  selectAuthState,
  (state: AuthState) => state.organizationId,
);

export const selectIsEnterpriseSSOEnabled = createSelector(
  selectAuthState,
  (state: AuthState) => state.isEnterpriseSSOEnabled,
);

export const selectUserRole = createSelector(
  selectCurrentUser,
  (user: User | null) => user?.role || null,
);

// Create a unified view model
export interface AuthViewModel {
  isAuthenticated: boolean;
  user: User | null;
  token: AuthToken | null;
  isLoading: boolean;
  error: any | null;
  organizationId: string | null;
  isEnterpriseSSOEnabled: boolean;
  role: string | null;
}

export const selectAuthViewModel = createSelector(
  selectIsAuthenticated,
  selectCurrentUser,
  selectAuthToken,
  selectAuthLoading,
  selectAuthError,
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
    role,
  ): AuthViewModel => ({
    isAuthenticated,
    user,
    token,
    isLoading,
    error,
    organizationId,
    isEnterpriseSSOEnabled,
    role,
  }),
);
