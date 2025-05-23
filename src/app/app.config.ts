import { APP_INITIALIZER, ApplicationConfig, importProvidersFrom, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { AuthModule } from '@auth0/auth0-angular';
import { provideStore, provideState } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideEffects } from '@ngrx/effects';
import { provideRouterStore } from '@ngrx/router-store';
import { HttpClientModule } from '@angular/common/http';
import { take } from 'rxjs/operators';

import { routes } from './app.routes';
import { reducers, metaReducers } from './store/reducers';
import { AUTH_CONFIG } from './core/services/auth/auth.config';
import { Router } from '@angular/router';
import { AuthService } from './core/services/auth/auth.service';
import { serviceRequestFeature } from './store/reducers/service-request.reducer';
import { userFeature } from './store/reducers/user.reducer';
import { ServiceRequestEffects } from './store/effects/service-request.effects';
import { authReducer } from './store/reducers/auth.reducer';
import { AuthEffects } from './store/effects/auth.effects';
import { UserEffects } from './store/effects/user.effects';
import { setupIconify } from './shared/utils/iconify';

// Factory function to handle authentication state on app initialization
export function initializeAuth(authService: AuthService) {
  return () => {
    console.log('Initializing auth with simplified logic');

    // Simple promise that resolves immediately without complex auth handling
    return new Promise<void>((resolve) => {
      // Skip complex URL handling entirely
      if (window.location.pathname === '/callback') {
        console.log('On callback page, letting Auth0 SDK handle it');
        resolve();
        return;
      }

      // Simple auth check that doesn't trigger redirects
      authService.isAuthenticated().pipe(take(1)).subscribe({
        next: (isAuthenticated) => {
          console.log('Auth check complete, authenticated:', isAuthenticated);
          // We don't need to do anything special here now,
          // as the auth service will properly dispatch the setAuthState action
          resolve();
        },
        error: (err) => {
          console.error('Auth initialization error:', err);
          resolve();
        }
      });
    });
  };
}

// Iconify initialization function for APP_INITIALIZER
export function initializeIconify() {
  return () => {
    // Import Iconify to ensure it's loaded
    import('iconify-icon');
    // Call setup function
    return setupIconify();
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
    // Register the auth state explicitly
    provideState('auth', authReducer),
    // Register the service request feature state correctly
    provideState(serviceRequestFeature.name, serviceRequestFeature.reducer),
    // Register the user feature state
    provideState(userFeature.name, userFeature.reducer),
    provideStoreDevtools({
      maxAge: 25,
      logOnly: !isDevMode(),
      autoPause: true,
      trace: false,
      traceLimit: 75,
    }),
    provideRouterStore(),
    provideEffects([ServiceRequestEffects, AuthEffects, UserEffects]),
    // Add initializer to handle auth state on app startup
    {
      provide: APP_INITIALIZER,
      useFactory: initializeAuth,
      deps: [AuthService],
      multi: true
    },
    // Initialize Iconify
    {
      provide: APP_INITIALIZER,
      useFactory: initializeIconify,
      multi: true
    }
  ]
};
