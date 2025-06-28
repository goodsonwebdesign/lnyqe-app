import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AuthActions } from '../../../store/actions/auth.actions';
import { AuthService as Auth0Service } from '@auth0/auth0-angular';
import { take, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-callback',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex h-screen w-full items-center justify-center">
      <svg
        class="-ml-1 mr-3 h-8 w-8 animate-spin text-primary"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        ></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    </div>
  `,
})
export class CallbackComponent implements OnInit {
  private store = inject(Store);
  private auth0 = inject(Auth0Service);
  private router = inject(Router);

  ngOnInit(): void {
    this.auth0.handleRedirectCallback().pipe(
      take(1),
      catchError((error: unknown) => {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during login.';
        this.store.dispatch(AuthActions.loginFailure({ error: errorMessage }));
        this.router.navigate(['/']); // On failure, redirect to a safe page.
        return of(null); // Gracefully handle the error stream.
      })
    ).subscribe(result => {
      // Only dispatch checkAuth if handleRedirectCallback was successful.
      // If an error occurred, the stream emits null and we do nothing further.
      if (result !== null) {
        this.store.dispatch(AuthActions.checkAuth());
      }
    });
  }
}
