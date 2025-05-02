import { APP_INITIALIZER, ApplicationConfig, importProvidersFrom, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { AuthModule } from '@auth0/auth0-angular';
import { provideStore } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideEffects } from '@ngrx/effects';
import { provideRouterStore } from '@ngrx/router-store';
import { HttpClientModule } from '@angular/common/http';

import { routes } from './app.routes';
import { reducers, metaReducers } from './store/reducers';
// Temporarily commenting out the problematic effects import
// import { CounterEffects } from './store/effects/counter.effects';
import { AUTH_CONFIG } from './core/services/auth/auth.config';
import { Router } from '@angular/router';
import { AuthService } from './core/services/auth/auth.service';

// Factory function to handle authentication state on app initialization
export function initializeAuth(authService: AuthService, router: Router) {
  return () => {
    // Check if the URL contains Auth0 callback parameters but we're not on the callback route
    const params = new URLSearchParams(window.location.search);
    const isCallback = params.has('code') && params.has('state');
    const isCallbackRoute = window.location.pathname === '/callback';

    if (isCallback && !isCallbackRoute) {
      console.log('Auth0 callback detected in app initialization');
      // If we detect Auth0 parameters but we're not on the callback route,
      // we need to manually handle the callback
      return new Promise<void>((resolve) => {
        authService.handleAuthCallback().subscribe({
          next: () => {
            console.log('Auth callback handled in app initialization');
            resolve();
          },
          error: (err) => {
            console.error('Auth error in app initialization:', err);
            resolve();
          }
        });
      });
    }

    // Check authenticated state and redirect if needed
    return new Promise<void>((resolve) => {
      authService.isAuthenticated().subscribe(isAuthenticated => {
        if (isAuthenticated && window.location.pathname === '/') {
          console.log('User is authenticated, redirecting to dashboard');
          router.navigate(['/dashboard']);
        }
        resolve();
      });
    });
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom(
      BrowserModule,
      AuthModule.forRoot(AUTH_CONFIG),
      HttpClientModule
    ),
    provideRouter(routes),
    provideStore(reducers, { metaReducers }),
    provideStoreDevtools({
      maxAge: 25,
      logOnly: !isDevMode(),
      autoPause: true,
      trace: false,
      traceLimit: 75,
    }),
    provideRouterStore(),
    // Temporarily removing counter effects to resolve the error
    provideEffects([]),
    // Add initializer to handle auth state on app startup
    {
      provide: APP_INITIALIZER,
      useFactory: initializeAuth,
      deps: [AuthService, Router],
      multi: true
    }
  ]
};
