import { createReducer, on } from '@ngrx/store';
import { AuthActions } from '../actions/auth.actions';
import { AuthState } from '../../core/models/auth.model';

export const initialAuthState: AuthState = {
  isAuthenticated: false,
  isLoading: false,
  user: null,
  error: null,
  organizationId: null,
  isEnterpriseSSOEnabled: false,
  token: null,
  role: null
};

export const authReducer = createReducer(
  initialAuthState,

  on(AuthActions.loginRequest, (state, { organization }) => ({
    ...state,
    isLoading: true,
    error: null,
    organizationId: organization || state.organizationId
  })),

  on(AuthActions.loginSuccess, (state, { user, token }) => ({
    ...state,
    isAuthenticated: true,
    isLoading: false,
    user,
    token,
    error: null,
    organizationId: user?.organizationId || state.organizationId,
    role: user?.role || null
  })),

  on(AuthActions.loginFailure, (state, { error }) => ({
    ...state,
    isAuthenticated: false,
    isLoading: false,
    user: null,
    token: null,
    error,
    role: null
  })),

  on(AuthActions.refreshTokenSuccess, (state, { token }) => ({
    ...state,
    token
  })),

  on(AuthActions.refreshTokenFailure, (state, { error }) => ({
    ...state,
    error
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
