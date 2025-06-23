import { AuthToken } from '../../core/models/auth.model';
import { User } from '../../core/models/user.model';
import { createActionGroup, emptyProps, props } from '@ngrx/store';

// Auth actions group
export const AuthActions = createActionGroup({
  source: 'Auth',
  events: {
    'Auth Callback Started': emptyProps(),
    'Login Request': props<{ organization?: string }>(),
    'Login Success': props<{ user: User; token: AuthToken }>(),
    'Login Failure': props<{ error: string }>(),
    Logout: emptyProps(),
    'Check Auth': emptyProps(),
    'Load User': emptyProps(), // For fetching user profile
    'Load User Success': props<{ user: User }>(),
    'Load User Failure': props<{ error: string }>(),
    'Set Organization': props<{ organizationId: string }>(),
    'Set Enterprise SSO Enabled': props<{ enabled: boolean }>(),
    'Set Auth State': props<{ isAuthenticated: boolean }>(),
  },
});

// For backward compatibility during migration
export const authCallbackStarted = AuthActions.authCallbackStarted;
export const loginRequest = AuthActions.loginRequest;
export const loginSuccess = AuthActions.loginSuccess;
export const loginFailure = AuthActions.loginFailure;
export const logout = AuthActions.logout;
export const checkAuth = AuthActions.checkAuth;
export const loadUser = AuthActions.loadUser;
export const loadUserSuccess = AuthActions.loadUserSuccess;
export const loadUserFailure = AuthActions.loadUserFailure;
export const setOrganization = AuthActions.setOrganization;
export const setEnterpriseSSOEnabled = AuthActions.setEnterpriseSSOEnabled;
export const setAuthState = AuthActions.setAuthState;
