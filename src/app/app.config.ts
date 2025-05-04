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
import { AUTH_CONFIG } from './core/services/auth/auth.config';
import { Router } from '@angular/router';
import { AuthService } from './core/services/auth/auth.service';
import { PopupService } from './core/services/popup/popup.service';

// Factory function to handle authentication state on app initialization
export function initializeAuth(authService: AuthService, router: Router) {
  return () => {
    // Skip URL parameter processing entirely in app initialization
    // This prevents Vite's middleware from trying to decode potentially malformed URIs
    console.log('Initializing auth without URL parameter processing');

    // Only check authentication state without touching URL parameters
    return new Promise<void>((resolve) => {
      // Simple auth check without URL parameter handling
      authService.isAuthenticated().subscribe({
        next: isAuthenticated => {
          if (isAuthenticated && window.location.pathname === '/') {
            console.log('User is authenticated, redirecting to dashboard');
            router.navigate(['/dashboard']);
          }
          resolve();
        },
        error: () => {
          console.error('Error checking authentication during initialization');
          resolve();
        }
      });
    });
  };
}

// Factory function to initialize popup components
export function initializePopups(popupService: PopupService) {
  return () => {
    console.log('Initializing popup components through APP_INITIALIZER');
    return new Promise<void>((resolve) => {
      // Slightly delay popup initialization to ensure app is stable
      setTimeout(() => {
        popupService.initializePopupComponents();
        resolve();
      }, 100);
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
    provideEffects([]),
    // Add initializer to handle auth state on app startup
    {
      provide: APP_INITIALIZER,
      useFactory: initializeAuth,
      deps: [AuthService, Router],
      multi: true
    },
    // Add initializer to set up popup components
    {
      provide: APP_INITIALIZER,
      useFactory: initializePopups,
      deps: [PopupService],
      multi: true
    }
  ]
};
