import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthState } from '../reducers/auth.reducer';

// Define the AuthViewModel interface
export interface AuthViewModel {
  isAuthenticated: boolean;
  user: any | null;
  isLoading: boolean;
  error: any | null;
  organizationId: string | null;
  isEnterpriseSSOEnabled: boolean;
  role: string | null;  // Added role field
}

// Feature selector
export const selectAuthState = createFeatureSelector<AuthState>('auth');

// Individual selectors for different parts of the auth state
export const selectIsAuthenticated = createSelector(
  selectAuthState,
  (state: AuthState) => state.isAuthenticated
);

export const selectCurrentUser = createSelector(
  selectAuthState,
  (state: AuthState) => state.user
);

export const selectAuthLoading = createSelector(
  selectAuthState,
  (state: AuthState) => state.isLoading
);

export const selectAuthError = createSelector(
  selectAuthState,
  (state: AuthState) => state.error
);

export const selectOrganizationId = createSelector(
  selectAuthState,
  (state: AuthState) => state.organizationId
);

export const selectIsEnterpriseSSOEnabled = createSelector(
  selectAuthState,
  (state: AuthState) => state.isEnterpriseSSOEnabled
);

// Create a selector for user role
export const selectUserRole = createSelector(
  selectCurrentUser,
  (user: any) => user?.role || null
);

// Create a unified view model combining all auth-related state
export const selectAuthViewModel = createSelector(
  selectIsAuthenticated,
  selectCurrentUser,
  selectAuthLoading,
  selectAuthError,
  selectOrganizationId,
  selectIsEnterpriseSSOEnabled,
  selectUserRole,
  (isAuthenticated, user, isLoading, error, organizationId, isEnterpriseSSOEnabled, role): AuthViewModel => ({
    isAuthenticated,
    user,
    isLoading,
    error,
    organizationId,
    isEnterpriseSSOEnabled,
    role
  })
);
