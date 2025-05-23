import { createReducer, on } from '@ngrx/store';
import { AuthActions } from '../actions/auth.actions';

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any | null;
  error: any | null;
  organizationId: string | null;
  isEnterpriseSSOEnabled: boolean;
  role: string | null; // Added role field
}

export const initialAuthState: AuthState = {
  isAuthenticated: false,
  isLoading: false,
  user: null,
  error: null,
  organizationId: null,
  isEnterpriseSSOEnabled: false,
  role: null // Initialize role as null
};

export const authReducer = createReducer(
  initialAuthState,

  on(AuthActions.loginRequest, (state, { organization }) => ({
    ...state,
    isLoading: true,
    error: null,
    organizationId: organization || state.organizationId
  })),

  on(AuthActions.loginSuccess, (state, { user }) => ({
    ...state,
    isAuthenticated: true,
    isLoading: false,
    user,
    error: null,
    // Extract organization ID from user metadata if available
    organizationId: user?.org_id || state.organizationId,
    // Extract role from user
    role: user?.role || null
  })),

  on(AuthActions.loginFailure, (state, { error }) => ({
    ...state,
    isAuthenticated: false,
    isLoading: false,
    user: null,
    error,
    role: null
  })),

  on(AuthActions.logout, () => ({
    ...initialAuthState
  })),

  on(AuthActions.setOrganization, (state, { organizationId }) => ({
    ...state,
    organizationId
  })),

  on(AuthActions.setEnterpriseSSOEnabled, (state, { enabled }) => ({
    ...state,
    isEnterpriseSSOEnabled: enabled
  })),

  on(AuthActions.setAuthState, (state, { isAuthenticated }) => ({
    ...state,
    isAuthenticated
  }))
);
