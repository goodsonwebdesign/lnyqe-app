import { User } from './user.model'; // Import the main User model

export interface AuthToken {
  accessToken: string;
  expiresIn: number;
  tokenType: string;
  scope: string;
  idToken?: string;
}

export interface UserApiResponse {
  user: User;
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  isRedirecting: boolean;
  user: User | null; // Store the User object directly
  error: string | null;
  organizationId: string | null;
  isEnterpriseSSOEnabled: boolean;
  token: AuthToken | null;
}
