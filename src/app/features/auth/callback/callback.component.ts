import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth/auth.service';
import { Store } from '@ngrx/store';
import { AuthActions } from '../../../store/actions/auth.actions';
import { AuthService as Auth0Service } from '@auth0/auth0-angular';
import { take, switchMap, catchError } from 'rxjs/operators';
import { from, of } from 'rxjs';
import { IdToken } from '@auth0/auth0-spa-js';
import { AuthUser, AuthToken } from '../../../core/models/auth.model';

@Component({
  selector: 'app-callback',
  standalone: true,
  imports: [CommonModule],
  template: `<div></div>`, // Empty template since we're using global loading
})
export class CallbackComponent implements OnInit {
  private router = inject(Router);
  private auth0Service = inject(Auth0Service);
  private store = inject(Store);

  ngOnInit(): void {
    console.log('Callback component initialized');

    // Check if the user is already authenticated first
    this.auth0Service.isAuthenticated$.pipe(take(1)).subscribe((isAuthenticated) => {
      if (isAuthenticated) {
        console.log('User is already authenticated, proceeding to dashboard');
        this.router.navigate(['/dashboard']);
        return;
      }

      // Only try to handle the callback if not already authenticated
      this.handleCallback();
    });
  }

  private handleCallback(): void {
    this.auth0Service
      .handleRedirectCallback()
      .pipe(
        take(1),
        switchMap(() => this.auth0Service.isAuthenticated$),
        take(1),
        switchMap((isAuthenticated) => {
          if (isAuthenticated) {
            return this.auth0Service.user$.pipe(
              take(1),
              switchMap((user) => {
                if (!user) {
                  throw new Error('No user information available');
                }
                return this.auth0Service.idTokenClaims$.pipe(
                  take(1),
                  switchMap((claims) => {
                    if (!claims) {
                      throw new Error('No token claims available');
                    }
                    const processedUser: AuthUser = {
                      id: user.sub || '',
                      email: user.email || '',
                      first_name: user.given_name || '',
                      last_name: user.family_name || '',
                      avatar: user.picture || '',
                      emailVerified: user.email_verified || false,
                      created_at: new Date().toISOString(),
                      role: (user['https://lnyqe.io/roles']?.[0] || 'user') as string,
                      status: 'active',
                      department: user['https://lnyqe.io/department'] || '',
                      jobTitle: user['https://lnyqe.io/job_title'] || '',
                      employeeId: user['https://lnyqe.io/employee_id'] || '',
                      location: user['https://lnyqe.io/location'] || '',
                      organizationId: user['org_id'] || '',
                      usesSSO: !!user['org_id'],
                    };

                    // Get token expiration from claims
                    const tokenExpiry = claims.exp
                      ? new Date(claims.exp * 1000).getTime()
                      : Date.now() + 3600000;
                    const expiresIn = tokenExpiry - Date.now();

                    const token: AuthToken = {
                      accessToken: claims['__raw'],
                      idToken: claims['__raw'],
                      expiresIn,
                      tokenType: 'Bearer',
                      scope: 'openid profile email offline_access',
                    };

                    return of({ user: processedUser, token });
                  }),
                );
              }),
            );
          }
          // If not authenticated after redirect, try alternative approach
          console.log('Not authenticated after redirect callback, checking user status directly');
          return this.checkUserStatus();
        }),
        catchError((error) => {
          console.error('Error handling callback:', error);

          // For Invalid State errors, try to recover by checking if user is authenticated anyway
          if (error.message && error.message.includes('Invalid state')) {
            console.log('Auth0 state validation failed, trying alternative auth check');
            return this.checkUserStatus();
          }

          // For other errors, proceed with failure
          this.store.dispatch(AuthActions.loginFailure({ error }));
          this.router.navigate(['/']);
          return of(null);
        }),
      )
      .subscribe((result) => {
        if (result) {
          console.log('Successfully processed authentication for:', result.user.email);
          this.store.dispatch(AuthActions.loginSuccess({ user: result.user, token: result.token }));
          this.router.navigate(['/dashboard']);
        }
      });
  }

  // Alternative approach to get user info without relying on the callback state
  private checkUserStatus() {
    return this.auth0Service.isAuthenticated$.pipe(
      take(1),
      switchMap((isAuthenticated) => {
        if (!isAuthenticated) {
          throw new Error('User is not authenticated');
        }

        return this.auth0Service.user$.pipe(
          take(1),
          switchMap((user) => {
            if (!user) {
              throw new Error('No user information available');
            }

            return this.auth0Service.getAccessTokenSilently().pipe(
              take(1),
              switchMap((accessToken) => {
                return this.auth0Service.idTokenClaims$.pipe(
                  take(1),
                  switchMap((claims) => {
                    if (!claims) {
                      throw new Error('No token claims available');
                    }

                    const processedUser: AuthUser = {
                      id: user.sub || '',
                      email: user.email || '',
                      first_name: user.given_name || '',
                      last_name: user.family_name || '',
                      avatar: user.picture || '',
                      emailVerified: user.email_verified || false,
                      created_at: new Date().toISOString(),
                      role: (user['https://lnyqe.io/roles']?.[0] || 'user') as string,
                      status: 'active',
                      department: user['https://lnyqe.io/department'] || '',
                      jobTitle: user['https://lnyqe.io/job_title'] || '',
                      employeeId: user['https://lnyqe.io/employee_id'] || '',
                      location: user['https://lnyqe.io/location'] || '',
                      organizationId: user['org_id'] || '',
                      usesSSO: !!user['org_id'],
                    };

                    const tokenExpiry = claims.exp
                      ? new Date(claims.exp * 1000).getTime()
                      : Date.now() + 3600000;
                    const expiresIn = tokenExpiry - Date.now();

                    const token: AuthToken = {
                      accessToken,
                      idToken: claims['__raw'],
                      expiresIn,
                      tokenType: 'Bearer',
                      scope: 'openid profile email offline_access',
                    };

                    return of({ user: processedUser, token });
                  }),
                );
              }),
            );
          }),
        );
      }),
    );
  }
}
