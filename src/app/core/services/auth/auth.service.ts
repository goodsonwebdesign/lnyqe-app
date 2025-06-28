import { Injectable, inject } from '@angular/core';
import { AuthService as Auth0Service } from '@auth0/auth0-angular';
import { Store } from '@ngrx/store';
import { from, Observable, forkJoin, filter, map, take } from 'rxjs';
import {
  selectIsAuthenticated,
  selectCurrentUser,
  selectAuthToken,
} from '../../../store/selectors/auth.selectors';
import { AuthToken } from '../../models/auth.model';
import { User } from '../../models/user.model';
import { environment } from '../../../../environments/environment';

/**
 * @description A lean, stateless service that acts as a wrapper around the Auth0 SDK
 * and provides selectors for accessing authentication state from the NgRx store.
 * All complex logic and side effects are handled by AuthEffects.
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private store = inject(Store);
  private auth0 = inject(Auth0Service);

  // --- State Selectors ---

  /**
   * @description An observable that emits the current authenticated status.
   */
  readonly isAuthenticated$: Observable<boolean> = this.store.select(selectIsAuthenticated);

  /**
   * @description An observable that emits the current user object.
   */
  readonly user$: Observable<User | null> = this.store.select(selectCurrentUser);

  /**
   * @description An observable that emits the full AuthToken object.
   */
  readonly token$: Observable<AuthToken | null> = this.store.select(selectAuthToken);

  /**
   * @description An observable that emits the raw JWT access token for API authorization.
   */
  readonly apiToken$: Observable<string | null> = this.store.select(selectAuthToken).pipe(
    map((token) => token?.accessToken || null)
  );

  // --- Token Management ---

  /**
   * @description Retrieves a new token set from Auth0. This is the single, authoritative method
   * for acquiring tokens for API calls. It is designed to be called from NgRx effects.
   * It concurrently fetches the access token and ID token claims.
   * @returns An observable that emits a complete AuthToken object.
   */
  getFreshToken$(): Observable<AuthToken> {
    const accessToken$ = from(
      this.auth0.getAccessTokenSilently({
        authorizationParams: {
          audience: environment.auth.apiAudience,
        },
      })
    );

    const claims$ = this.auth0.idTokenClaims$.pipe(
      filter((claims): claims is import('@auth0/auth0-angular').IdToken => !!claims),
      take(1)
    );

    return forkJoin({
      accessToken: accessToken$,
      claims: claims$,
    }).pipe(
      map(({ accessToken, claims }) => {
        if (!accessToken || !claims?.__raw || !claims?.exp) {
          throw new Error('Failed to retrieve a valid token set.');
        }

        const authToken: AuthToken = {
          accessToken,
          idToken: claims.__raw,
          expiresIn: claims.exp * 1000 - Date.now(), // Convert expiry to milliseconds
          tokenType: 'Bearer',
          scope: claims['scope'] || 'openid profile email',
        };
        return authToken;
      })
    );
  }
}


