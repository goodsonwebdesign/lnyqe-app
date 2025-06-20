import { AuthState } from '../../core/models/auth.model';
import { AuthActions } from '../actions/auth.actions';
import { AppActions } from '../actions/app.actions'; // Import AppActions
import { createReducer, on } from '@ngrx/store';

export const initialAuthState: AuthState = {
  isAuthenticated: false,
  isLoading: false,
  user: null,
  error: null,
  organizationId: null,
  isEnterpriseSSOEnabled: false,
  token: null,
};

export const authReducer = createReducer(
  initialAuthState,

  // Handle global loading state
  on(AppActions.loadingStarted, (state) => ({
    ...state,
    isLoading: true,
  })),

  on(AppActions.loadingCompleted, (state) => ({
    ...state,
    isLoading: false,
  })),

  on(AuthActions.loginRequest, (state, { organization }) => ({
    ...state,
    isLoading: true,
    error: null,
    organizationId: organization || state.organizationId,
  })),

  on(AuthActions.loginSuccess, (state, { user, token }) => ({
    ...state,
    isAuthenticated: true,
    isLoading: false,
    user, // The user object is now passed directly
    token,
    error: null,
  })),

  on(AuthActions.loginFailure, (state, { error }) => ({
    ...state,
    isAuthenticated: false,
    isLoading: false,
    user: null,
    token: null,
    error,
  })),

  on(AuthActions.loadUser, state => ({
    ...state,
    isLoading: true,
    error: null,
  })),

  on(AuthActions.loadUserSuccess, (state, { user }) => ({
    ...state,
    isLoading: false,
    user,
  })),

  on(AuthActions.loadUserFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
  })),

  on(AuthActions.logout, () => initialAuthState),

  on(AuthActions.setOrganization, (state, { organizationId }) => ({
    ...state,
    organizationId,
  })),

  on(AuthActions.setEnterpriseSSOEnabled, (state, { enabled }) => ({
    ...state,
    isEnterpriseSSOEnabled: enabled,
  })),

  on(AuthActions.setAuthState, (state, { isAuthenticated }) => ({
    ...state,
    isAuthenticated,
  })),
);
