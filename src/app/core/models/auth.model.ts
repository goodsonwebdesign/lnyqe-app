export interface AuthToken {
  accessToken: string;
  expiresIn: number;
  tokenType: string;
  scope: string;
  idToken?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar?: string;
  emailVerified: boolean;
  created_at: string;
  role: string;
  status: string;
  department?: string;
  jobTitle?: string;
  employeeId?: string;
  location?: string;
  organizationId?: string;
  usesSSO: boolean;
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  error: any | null;
  organizationId: string | null;
  isEnterpriseSSOEnabled: boolean;
  token: AuthToken | null;
  role: string | null;
}
