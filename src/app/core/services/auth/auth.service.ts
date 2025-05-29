import { Injectable, inject, NgZone } from '@angular/core';
import { AuthService as Auth0Service } from '@auth0/auth0-angular';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, from, firstValueFrom, of } from 'rxjs';
import { filter, take, distinctUntilChanged, map, switchMap, catchError } from 'rxjs/operators';
import * as AuthActions from '../../../store/actions/auth.actions';
import {
  selectIsAuthenticated,
  selectCurrentUser,
  selectAuthToken,
} from '../../../store/selectors/auth.selectors';
import { AuthUser, AuthToken } from '../../models/auth.model';
import { environment } from '../../../../environments/environment';

/**
 * Auth Service - handles authentication with Auth0 and JWT token management
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // Expose Auth0Service publicly to enable direct access in auth guard
  readonly auth0Service = inject(Auth0Service);
  private router = inject(Router);
  private store = inject(Store);
  private ngZone = inject(NgZone);
  private isInitialAuthCheck = true;

  constructor() {
    console.log('Auth Service initialized');

    // Monitor Auth0 authentication state
    this.auth0Service.isAuthenticated$
      .pipe(
        filter((isAuthenticated) => isAuthenticated !== undefined),
        distinctUntilChanged(),
      )
      .subscribe((isAuthenticated) => {
        console.log('Auth state changed:', isAuthenticated);

        if (isAuthenticated) {
          // Get both user info and token
          this.auth0Service.user$
            .pipe(
              filter((user) => !!user),
              take(1),
              switchMap((user) =>
                from(this.getTokenSilently()).pipe(
                  map((token) => ({ user: this.processUserProfile(user), token })),
                ),
              ),
            )
            .subscribe({
              next: ({ user, token }) => {
                console.log('User authenticated:', user.email);
                this.store.dispatch(AuthActions.loginSuccess({ user, token }));
              },
              error: (error) => {
                console.error('Error processing auth:', error);
                this.store.dispatch(AuthActions.loginFailure({ error }));
              },
            });

          this.isInitialAuthCheck = false;
        } else {
          // Handle unauthenticated state
          if (!this.isInitialAuthCheck) {
            console.log('User logged out or token expired');
            this.store.dispatch(AuthActions.logout());
          } else {
            console.log('Initial auth check: not authenticated');
            this.store.dispatch(AuthActions.setAuthState({ isAuthenticated: false }));
            this.isInitialAuthCheck = false;
          }
        }
      });

    // Set up token refresh interval
    this.setupTokenRefresh();
  }

  /**
   * Log in user via Auth0
   */
  login(organization?: string): void {
    console.log('Redirecting to Auth0 login page...');

    this.ngZone.run(() => {
      this.auth0Service.loginWithRedirect({
        appState: { target: '/dashboard' },
        authorizationParams: organization ? { organization } : undefined,
      });
    });
  }

  /**
   * Log out user
   */
  logout(): void {
    this.store.dispatch(AuthActions.logout());

    this.auth0Service.logout({
      logoutParams: {
        returnTo: window.location.origin,
        clientId: 'jaxCqNsBtZmpnpbjXBsAzYkhygDKg4TM',
      },
    });
  }

  /**
   * Get the current user
   */
  getUser(): Observable<AuthUser | null> {
    return this.store.select(selectCurrentUser);
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): Observable<boolean> {
    return this.store.select(selectIsAuthenticated);
  }

  /**
   * Get the current auth token
   */
  getToken(): Observable<AuthToken | null> {
    return this.store.select(selectAuthToken);
  }

  /**
   * Get the raw JWT access token for API authorization
   * This returns the token that should be sent in the Authorization header
   */
  getApiToken(): Observable<string | null> {
    return this.store.select(selectAuthToken).pipe(map((token) => token?.accessToken || null));
  }

  /**
   * Get a new token silently from Auth0
   * Returns both the raw JWT access token (for API validation) and ID token
   */
  async getTokenSilently(): Promise<AuthToken> {
    try {
      // Get the raw JWT access token - this is what we'll send to the API
      const accessToken = await firstValueFrom(this.auth0Service.getAccessTokenSilently());
      // Get the ID token claims for user info
      const claims = await firstValueFrom(this.auth0Service.idTokenClaims$);

      if (!accessToken) {
        throw new Error('No access token received');
      }

      // Log the token type to verify it's suitable for API calls (but don't log the actual token)
      console.debug('Token received for API authorization', {
        tokenLength: accessToken.length,
        tokenType: 'Bearer',
      });

      return {
        accessToken, // This is the raw JWT token to send to your API
        expiresIn: claims?.exp ? claims.exp * 1000 - Date.now() : 3600 * 1000,
        tokenType: 'Bearer',
        scope: claims?.['scope'] || 'openid profile email',
        idToken: claims?.__raw, // Store the ID token separately
      };
    } catch (error) {
      console.error('Failed to get token silently:', error);
      throw new Error('Failed to get token silently: ' + error);
    }
  }

  /**
   * Get a token specifically for API calls with the correct audience
   * This is separate from the authentication token to avoid breaking the auth flow
   */
  async getApiAccessToken(apiIdentifier: string = 'https://api.lynqe.com'): Promise<string> {
    try {
      console.log(`Requesting API token with audience: ${apiIdentifier}`);

      // This is the approach that works - use it directly
      const token = await firstValueFrom(
        this.auth0Service.getAccessTokenSilently({
          authorizationParams: {
            audience: apiIdentifier,
          },
        }),
      );

      if (!token) {
        throw new Error('No API access token received');
      }

      // Decode and log token info (without logging the full token)
      try {
        const tokenParts = token.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          console.log('API Token details:', {
            audience: payload.aud,
            expiration: new Date(payload.exp * 1000).toISOString(),
            issuer: payload.iss,
          });

          // Check if audience is still an array and warn if it is
          if (Array.isArray(payload.aud)) {
            console.warn('Warning: Token still has multiple audiences:', payload.aud);
          }
        }
      } catch (e) {
        console.error('Error decoding token:', e);
      }

      console.log('API token received for authorization', {
        tokenLength: token.length,
        audience: apiIdentifier,
      });

      return token;
    } catch (error) {
      console.error('Failed to get API token:', error);
      throw new Error('Failed to get API token: ' + error);
    }
  }

  /**
   * Test method to explicitly request an API token
   * This helps verify if Auth0 is properly configured to issue API tokens
   */
  async testApiTokenRequest(apiAudience: string = 'https://api.lynqe.com'): Promise<void> {
    try {
      console.log(`AUTH TEST: Requesting token with audience: ${apiAudience}`);
      console.log('AUTH TEST: Including scopes: openid profile email offline_access');

      const token = await this.getApiAccessToken(apiAudience);

      if (token) {
        console.log('AUTH TEST: Token received successfully');

        // Decode token to verify audience
        try {
          const tokenParts = token.split('.');
          if (tokenParts.length === 3) {
            const payload = JSON.parse(atob(tokenParts[1]));
            console.log('AUTH TEST: Token audience:', payload.aud);
            console.log('AUTH TEST: Token issuer:', payload.iss);
            console.log('AUTH TEST: Token scopes:', payload.scope);
            console.log('AUTH TEST: Token expiration:', new Date(payload.exp * 1000).toISOString());
          }
        } catch (e) {
          console.error('AUTH TEST: Error decoding token:', e);
        }
      }
    } catch (error) {
      console.error('AUTH TEST: Failed to get API token:', error);

      // Provide more helpful error information
      const errorMessage = String(error);
      if (errorMessage.includes('Missing Refresh Token')) {
        console.error('AUTH TEST: This error typically occurs when:');
        console.error('1. The user has not completed authentication');
        console.error('2. Auth0 application settings do not allow offline access');
        console.error('3. The token storage is being cleared between operations');
        console.error('→ Try logging out and logging back in with the offline_access scope');
      }
    }
  }

  /**
   * Set up automatic token refresh
   */
  private setupTokenRefresh(): void {
    // Check token expiration every minute
    setInterval(() => {
      this.getToken()
        .pipe(take(1))
        .subscribe((token) => {
          if (token && token.expiresIn < 300000) {
            // Refresh if less than 5 minutes until expiry
            this.refreshToken();
          }
        });
    }, 60000);
  }

  /**
   * Refresh the auth token
   */
  private refreshToken(): void {
    from(this.getTokenSilently())
      .pipe(take(1))
      .subscribe({
        next: (token) => this.store.dispatch(AuthActions.refreshTokenSuccess({ token })),
        error: (error) => this.store.dispatch(AuthActions.refreshTokenFailure({ error })),
      });
  }

  /**
   * Process Auth0 user data into our User model
   */
  processUserProfile(auth0User: any): AuthUser {
    if (!auth0User) {
      throw new Error('No user data available');
    }

    return {
      id: auth0User.sub,
      email: auth0User.email,
      first_name: auth0User.given_name || '',
      last_name: auth0User.family_name || '',
      avatar: auth0User.picture,
      emailVerified: auth0User.email_verified,
      created_at: new Date().toISOString(),
      role: this.determineUserRole(auth0User),
      status: 'active',
      department: auth0User?.['https://lnyqe.io/department'] || '',
      jobTitle: auth0User?.['https://lnyqe.io/job_title'] || '',
      employeeId: auth0User?.['https://lnyqe.io/employee_id'] || '',
      location: auth0User?.['https://lnyqe.io/location'] || '',
      organizationId: auth0User?.org_id || '',
      usesSSO: !!auth0User?.org_id,
    };
  }

  /**
   * Determine user role from Auth0 user data
   */
  private determineUserRole(auth0User: any): string {
    const roles = auth0User?.['https://lnyqe.io/roles'] || [];

    if (roles.includes('admin')) {
      return 'admin';
    } else if (roles.includes('facility_manager')) {
      return 'facility_manager';
    } else if (roles.includes('staff')) {
      return 'staff';
    }
    return 'guest';
  }
}
