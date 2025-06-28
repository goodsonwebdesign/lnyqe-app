import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { AuthState, AuthToken } from '../../core/models/auth.model';

/**
 * @description Defines the action group for authentication-related events.
 */
export const AuthActions = createActionGroup({
  source: 'Auth',
  events: {
    // Dispatched on application startup to initialize the auth flow
    'Init Auth': emptyProps(),

    // Signals the start of the initial authentication check
    'Auth Check Start': emptyProps(),

    // Signals the end of the initial authentication check
    'Auth Check End': emptyProps(),

    // Triggers the login flow via Auth0 redirect
    'Login Request': props<{ organization?: string }>(),

    // Dispatched by an effect after a successful token and user fetch
    'Login Success': props<{ payload: Partial<AuthState> }>(),

    // Dispatched by an effect when any part of the auth flow fails
    'Login Failure': props<{ error: string }>(),

    // Triggers the logout flow
    'Logout': emptyProps(),

    // Dispatched after a successful Auth0 login to fetch user data and tokens
    'Check Auth': emptyProps(),

    // Dispatched by an effect with a fresh token from Auth0
    'Set Auth Token': props<{ token: AuthToken }>(),

    // Dispatched by an effect after token is stored to trigger user profile fetch
    'Fetch User Profile': emptyProps(),
  },
});
