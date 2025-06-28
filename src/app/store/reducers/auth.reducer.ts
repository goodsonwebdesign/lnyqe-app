import { createFeature, createReducer, on } from '@ngrx/store';
import { AuthState } from '../../core/models/auth.model';
import { AuthActions } from '../actions/auth.actions';

export const initialAuthState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
  isLoading: false,
  isAuthLoading: true,
  isRedirecting: false,
  error: null,
  organizationId: null,
  isEnterpriseSSOEnabled: false,
};

export const authReducer = createReducer(
  initialAuthState,
  on(AuthActions.loginRequest, (state, { organization }) => ({
    ...state,
    isLoading: true,
    isRedirecting: true,
    error: null,
    organizationId: organization || state.organizationId,
  })),

  on(AuthActions.loginSuccess, (state, { payload }) => ({
    ...state,
    ...payload,
    isAuthenticated: true,
    isLoading: false,
    isRedirecting: false,
    error: null,
  })),

  on(AuthActions.loginFailure, (state, { error }) => ({
    ...state,
    ...initialAuthState,
    error,
  })),

  on(AuthActions.logout, () => ({
    ...initialAuthState,
  })),

  on(AuthActions.authCheckStart, (state) => ({
    ...state,
    isAuthLoading: true,
  })),

  on(AuthActions.authCheckEnd, (state) => ({
    ...state,
    isAuthLoading: false,
  })),

  on(AuthActions.checkAuth, (state) => ({
    ...state,
    isLoading: true,
    error: null,
  })),

  on(AuthActions.setAuthToken, (state, { token }) => ({
    ...state,
    isAuthenticated: true,
    token,
    error: null,
  }))
);

export const authFeature = createFeature({
  name: 'auth',
  reducer: authReducer,
});

export const {
  name,
  reducer,
  selectAuthState,
  selectIsAuthenticated,
  selectUser,
  selectToken,
  selectIsLoading,
  selectIsAuthLoading,
  selectError,
  selectOrganizationId,
  selectIsEnterpriseSSOEnabled,
  selectIsRedirecting,
} = authFeature;



