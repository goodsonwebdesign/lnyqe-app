import { createAction, props } from '@ngrx/store';

// Auth actions
export const loginRequest = createAction('[Auth] Login Request');
export const loginSuccess = createAction(
  '[Auth] Login Success',
  props<{ user: any }>()
);
export const loginFailure = createAction(
  '[Auth] Login Failure',
  props<{ error: any }>()
);
export const logout = createAction('[Auth] Logout');
export const checkAuth = createAction('[Auth] Check Auth');