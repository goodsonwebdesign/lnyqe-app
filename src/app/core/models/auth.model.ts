import { User } from './user.model';

/**
 * @description Represents the structure of the authentication token object from Auth0.
 */
export interface AuthToken {
  accessToken: string;
  idToken: string;
  expiresIn: number;
  tokenType: string;
  scope: string;
}

/**
 * @description The definitive state for the 'auth' feature slice in the NgRx store.
 * This interface represents the complete authentication state, including user details
 * and token information.
 */
export interface AuthState {
  // State flags
  isAuthenticated: boolean;
  isLoading: boolean;
  isAuthLoading: boolean;
  isRedirecting: boolean;
  error: string | null;
  organizationId: string | null;
  isEnterpriseSSOEnabled: boolean;

  // User and token data
  user: User | null;
  token: AuthToken | null;
}
