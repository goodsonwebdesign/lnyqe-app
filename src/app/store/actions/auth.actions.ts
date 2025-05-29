import { AuthToken, AuthUser } from '../../core/models/auth.model';
import { createActionGroup, emptyProps, props } from '@ngrx/store';

// Auth actions group
export const AuthActions = createActionGroup({
  source: 'Auth',
  events: {
    'Login Request': props<{ organization?: string }>(),
    'Login Success': props<{ user: AuthUser; token: AuthToken }>(),
    'Login Failure': props<{ error: any }>(),
    Logout: emptyProps(),
    'Check Auth': emptyProps(),
    'Set Organization': props<{ organizationId: string }>(),
    'Set Enterprise SSO Enabled': props<{ enabled: boolean }>(),
    'Set Auth State': props<{ isAuthenticated: boolean }>(),
    'Refresh Token': emptyProps(),
    'Refresh Token Success': props<{ token: AuthToken }>(),
    'Refresh Token Failure': props<{ error: any }>(),
  },
});

// For backward compatibility during migration
export const loginRequest = AuthActions.loginRequest;
export const loginSuccess = AuthActions.loginSuccess;
export const loginFailure = AuthActions.loginFailure;
export const logout = AuthActions.logout;
export const checkAuth = AuthActions.checkAuth;
export const setOrganization = AuthActions.setOrganization;
export const setEnterpriseSSOEnabled = AuthActions.setEnterpriseSSOEnabled;
export const setAuthState = AuthActions.setAuthState;
export const refreshToken = AuthActions.refreshToken;
export const refreshTokenSuccess = AuthActions.refreshTokenSuccess;
export const refreshTokenFailure = AuthActions.refreshTokenFailure;
