import { Injectable, inject, NgZone } from '@angular/core';
import { AuthService as Auth0Service } from '@auth0/auth0-angular';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, from, of } from 'rxjs';
import { tap, catchError, switchMap, filter, take } from 'rxjs/operators';
import * as AuthActions from '../../../store/actions/auth.actions';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth0Service = inject(Auth0Service);
  private router = inject(Router);
  private store = inject(Store);
  private ngZone = inject(NgZone);
  private isLoggingOut = false;

  constructor() {
    // Subscribe to authentication state changes from Auth0
    this.auth0Service.isAuthenticated$.subscribe(isAuthenticated => {
      if (isAuthenticated) {
        this.auth0Service.user$.pipe(
          filter(user => !!user),
          take(1)
        ).subscribe(user => {
          console.log('User authenticated:', user);
          this.store.dispatch(AuthActions.loginSuccess({ user }));

          // Check if we're on the home page or callback page, and redirect to dashboard if so
          const currentPath = window.location.pathname;
          if (currentPath === '/' || currentPath === '/callback') {
            this.ngZone.run(() => {
              console.log('Redirecting to dashboard after authentication');
              this.router.navigate(['/dashboard']);
            });
          }
        });
      } else if (!this.isLoggingOut) {
        // Only dispatch logout if we're not in the process of logging out
        // This prevents double-logout when auth0Service.logout() triggers isAuthenticated$ to emit false
        this.store.dispatch(AuthActions.logout());
      }
    });

    // Handle callback if we detect Auth0 params in the URL
    this.handleAuthenticationCallback();
  }

  // Login method - more direct approach
  login(): void {
    this.store.dispatch(AuthActions.loginRequest());
    this.auth0Service.loginWithRedirect({
      appState: { target: '/dashboard' }
    });
  }

  // Logout method
  logout(): void {
    // Set flag to prevent double logout
    this.isLoggingOut = true;

    // First dispatch the logout action to update application state
    this.store.dispatch(AuthActions.logout());

    // First navigate to home page
    this.router.navigate(['/']);

    // Then perform the Auth0 logout with explicit return URL
    this.auth0Service.logout({
      logoutParams: {
        returnTo: window.location.origin,
        clientId: 'jaxCqNsBtZmpnpbjXBsAzYkhygDKg4TM'
      }
    });
  }

  // Get authenticated user
  getUser(): Observable<any> {
    return this.auth0Service.user$;
  }

  // Check if user is authenticated
  isAuthenticated(): Observable<boolean> {
    return this.auth0Service.isAuthenticated$;
  }

  // Handle the authentication callback directly in the service
  private handleAuthenticationCallback(): void {
    const params = new URLSearchParams(window.location.search);
    if (params.has('code') && params.has('state')) {
      console.log('Handling Auth0 callback in service');
      from(this.auth0Service.handleRedirectCallback()).pipe(
        tap((appState) => {
          console.log('Auth0 callback handled successfully', appState);
          // Navigate to dashboard or the target from appState after successful authentication
          this.ngZone.run(() => {
            const targetUrl = appState.appState?.target || '/dashboard';
            console.log('Redirecting to:', targetUrl);
            this.router.navigate([targetUrl]);
          });
        }),
        catchError(error => {
          console.error('Authentication callback error:', error);
          return of(null);
        })
      ).subscribe();
    }
  }

  // Public method for the callback component to use if needed
  handleAuthCallback(): Observable<any> {
    return from(this.auth0Service.handleRedirectCallback()).pipe(
      tap((appState) => {
        const targetUrl = appState.appState?.target || '/dashboard';
        console.log('Callback component redirecting to:', targetUrl);
        this.ngZone.run(() => {
          this.router.navigate([targetUrl]);
        });
      }),
      catchError(error => {
        console.error('Error in handleAuthCallback:', error);
        return of({ error });
      })
    );
  }
}
