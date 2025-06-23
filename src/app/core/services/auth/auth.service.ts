import { Injectable, inject, NgZone } from '@angular/core';
import { AuthService as Auth0Service } from '@auth0/auth0-angular';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, firstValueFrom } from 'rxjs';
import { filter, distinctUntilChanged, map } from 'rxjs/operators';
import * as AuthActions from '../../../store/actions/auth.actions';
import {
  selectIsAuthenticated,
  selectCurrentUser,
  selectAuthToken,
} from '../../../store/selectors/auth.selectors';
import { AuthToken } from '../../models/auth.model';
import { User } from '../../models/user.model';

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
    // Monitor Auth0 authentication state
    this.auth0Service.isAuthenticated$
      .pipe(
        filter((isAuthenticated) => isAuthenticated !== undefined),
        distinctUntilChanged(),
      )
      .subscribe((isAuthenticated) => {
        if (isAuthenticated) {
          // Further actions like fetching user from backend and dispatching loginSuccess
          // will be handled by effects (e.g., checkAuth$) or components (e.g., callbackComponent).
        } else if (!this.isInitialAuthCheck) {
          // If not authenticated and it's not the initial check, dispatch logout
          this.store.dispatch(AuthActions.logout());
        }
        this.isInitialAuthCheck = false;
      });

    // The auth0-angular SDK handles token refreshes automatically via getAccessTokenSilently()
    // No need for manual setupTokenRefresh()
  }

  /**
   * Log in user via Auth0
   */
  login(organization?: string): void {
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
        clientId: environment.auth.clientId,
      },
    });
  }

  /**
   * Get the current user
   */
  getUser(): Observable<User | null> {
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

      return {
        accessToken, // This is the raw JWT token to send to your API
        expiresIn: claims?.exp ? claims.exp * 1000 - Date.now() : 3600 * 1000,
        tokenType: 'Bearer',
        scope: claims?.['scope'] || 'openid profile email',
        idToken: claims?.__raw, // Store the ID token separately
      };
    } catch (error) {
      console.error('Failed to get token silently:', error);
      // Re-throw the original error to preserve stack trace and context
      throw error;
    }
  }

  /**
   * Get a token specifically for API calls with the correct audience
   * This is separate from the authentication token to avoid breaking the auth flow
   */
  async getApiAccessToken(apiIdentifier: string = environment.auth.apiAudience): Promise<string> {
    try {
      // This is the approach that works - use it directly
      const token = await firstValueFrom(
        this.auth0Service.getAccessTokenSilently({
          authorizationParams: {
            audience: apiIdentifier,
            scope: '', // Explicitly request minimal/no specific scopes
          },
        }),
      );

      if (!token) {
        throw new Error('No API access token received');
      }

      return token;
    } catch (error) {
      console.error('Failed to get API token:', error); // Keep this error log for all environments
      // Re-throw the original error to preserve stack trace and context
      throw error;
    }
  }

  // Custom token refresh logic (setupTokenRefresh, refreshToken) has been removed.
  // The auth0-angular SDK's getAccessTokenSilently() method handles token refreshes automatically
  // when a valid refresh token is available and the access token is expired or nearing expiry.

}

