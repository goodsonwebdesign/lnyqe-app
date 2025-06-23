import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService as AppAuthService } from '../../../core/services/auth/auth.service'; // Renamed to avoid conflict
import { Store } from '@ngrx/store';
import { AuthActions } from '../../../store/actions/auth.actions';
import { AuthService as Auth0Service } from '@auth0/auth0-angular';
import { take, switchMap, catchError, map } from 'rxjs/operators';
import { from, of, Observable } from 'rxjs';
import { AuthToken } from '../../../core/models/auth.model';
import { User } from '../../../core/models/user.model';
import { UserService } from '../../../core/services/user/user.service'; // Added UserService

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
  private appAuthService = inject(AppAuthService);
  private userService = inject(UserService); // Injected UsersService

  ngOnInit(): void {
    // The auth0Service.handleRedirectCallback() below is designed to be called on the callback route.
    // It will process the authentication result. If a user is already authenticated and lands here,
    // the handleRedirectCallback might be a no-op or re-confirm, then the subsequent checkUserStatus
    // and loginSuccess action dispatch will ensure the user is correctly routed by effects.
    this.handleCallback();
  }

  private handleCallback(): void {
    this.auth0Service
      .handleRedirectCallback()
      .pipe(
        take(1),
        switchMap(() => {
          return this.checkUserStatus(); // Returns Observable<{ user: UserApiResponse; token: AuthToken }>
        }),
        map(({ user, token }: { user: User; token: AuthToken }) => { // user is now User
          this.store.dispatch(AuthActions.loginSuccess({ user, token })); // Dispatch User
          return user; // Return User for further processing
        }),
        // Removed tap operator that previously navigated. Navigation is now handled by loginSuccess$ effect.
        catchError((error: unknown) => {
          this.store.dispatch(AuthActions.loginFailure({ error }));
          this.router.navigate(['/']); // Navigate to a safe page on error
          return of(null); // Handle error gracefully
        })
      )
      .subscribe();
  }

  private checkUserStatus(): Observable<{ user: User; token: AuthToken }> {
    return this.auth0Service.isAuthenticated$.pipe(
      take(1),
      switchMap(isAuthenticated => {
        if (!isAuthenticated) {
          throw new Error('User not authenticated');
        }
        return this.auth0Service.user$.pipe(
          take(1),
          switchMap(auth0User => {
            if (!auth0User) {
              throw new Error('No Auth0 user information available');
            }
            // Get the complete AuthToken object for our API
            return from(this.appAuthService.getTokenSilently()).pipe(
              take(1),
              switchMap((authToken: AuthToken) => {
                if (!authToken || !authToken.accessToken) {
                  throw new Error('AuthToken or its accessToken is null or undefined.');
                }
                // Fetch backend user profile
                return this.userService.getMe().pipe(
                  map((backendUser: User) => {
                    if (!backendUser) {
                      throw new Error('Backend user profile is missing or undefined.');
                    }
                    return { user: backendUser, token: authToken };
                  })
                );
              })
            );
          })
        );
      })
    );
  }
}
