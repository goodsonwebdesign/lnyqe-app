import { createFeature, createReducer, on } from '@ngrx/store';
import { AuthState } from '../../core/models/auth.model';
import { AppActions } from '../actions/app.actions';
import { AuthActions } from '../actions/auth.actions';

export const initialAuthState: AuthState = {
  isAuthenticated: false,
  isLoading: false,
  isRedirecting: false,
  user: null,
  error: null,
  organizationId: null,
  isEnterpriseSSOEnabled: false,
  token: null,
};

export const authReducer = createReducer(
  initialAuthState,
  // Handle global loading state for non-redirect actions
  on(AppActions.loadingStarted, (state) => ({ ...state, isLoading: true })),
  on(AppActions.loadingCompleted, (state) => ({ ...state, isLoading: false })),

  // Handle auth-specific actions
  on(AuthActions.checkAuth, (state) => ({ ...state, isLoading: true, error: null })),

  on(AuthActions.setAuthState, (state, { isAuthenticated }) => ({
    ...state,
    isAuthenticated,
    isLoading: false,
  })),

  on(AuthActions.authCallbackStarted, (state) => ({ ...state, isLoading: true, isRedirecting: true })),

  on(AuthActions.loginRequest, (state, { organization }) => ({
    ...state,
    isLoading: true,
    isRedirecting: true,
    error: null,
    organizationId: organization || state.organizationId,
  })),

  on(AuthActions.loginSuccess, (state, { user, token }) => ({
    ...state,
    isAuthenticated: true,
    isLoading: false,
    isRedirecting: false,
    user,
    token,
    error: null,
  })),

  on(AuthActions.loginFailure, (state, { error }) => ({
    ...state,
    isAuthenticated: false,
    isLoading: false,
    isRedirecting: false,
    user: null,
    token: null,
    error,
  })),

  on(AuthActions.loadUser, (state) => ({
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

  on(AuthActions.logout, () => ({
    ...initialAuthState,
    isLoading: true,
    isRedirecting: true,
  })),

  on(AuthActions.setOrganization, (state, { organizationId }) => ({
    ...state,
    organizationId,
  })),

  on(AuthActions.setEnterpriseSSOEnabled, (state, { enabled }) => ({
    ...state,
    isEnterpriseSSOEnabled: enabled,
  }))
);

export const authFeature = createFeature({
  name: 'auth',
  reducer: authReducer,
});

export const {
  name, // feature name
  reducer, // feature reducer
  selectAuthState, // feature selector
  selectIsAuthenticated,
  selectIsLoading,
  selectUser,
  selectError,
  selectOrganizationId,
  selectIsEnterpriseSSOEnabled,
  selectToken,
} = authFeature;
