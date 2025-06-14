import { routes } from './app.routes';
import { AUTH_CONFIG } from './core/services/auth/auth.config';
import { AuthService } from './core/services/auth/auth.service';
import { setupIconify } from './shared/utils/iconify';
import { AppEffects } from './store/effects/app.effects';
import { AuthEffects } from './store/effects/auth.effects';
import { ServiceRequestEffects } from './store/effects/service-request.effects';
import { UserEffects } from './store/effects/user.effects';
import { metaReducers, reducers } from './store/reducers';
import { authReducer } from './store/reducers/auth.reducer';
import { serviceRequestFeature } from './store/reducers/service-request.reducer';
import { userFeature } from './store/reducers/user.reducer';
import { HttpClientModule } from '@angular/common/http';
import { APP_INITIALIZER, ApplicationConfig, importProvidersFrom, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { AuthModule } from '@auth0/auth0-angular';
import { provideEffects } from '@ngrx/effects';
import { provideRouterStore } from '@ngrx/router-store';
import { provideState, provideStore } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { take } from 'rxjs/operators';
import { provideServiceWorker } from '@angular/service-worker';

// Factory function to handle authentication state on app initialization
export function initializeAuth(authService: AuthService) {
  return () => {
    console.log('Initializing auth with simplified logic');

    return new Promise<void>((resolve) => {
      if (window.location.pathname === '/callback') {
        console.log('On callback page, letting Auth0 SDK handle it');
        resolve();
        return;
      }

      // Check auth state and dispatch appropriate action
      authService
        .isAuthenticated()
        .pipe(take(1))
        .subscribe({
          next: (isAuthenticated) => {
            console.log('Auth check complete, authenticated:', isAuthenticated);
            resolve();
          },
          error: (err) => {
            console.error('Auth initialization error:', err);
            resolve();
          },
        });
    });
  };
}

// Iconify initialization function for APP_INITIALIZER
export function initializeIconify() {
  return () => {
    import('iconify-icon');
    return setupIconify();
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom(BrowserModule, AuthModule.forRoot(AUTH_CONFIG), HttpClientModule),
    provideRouter(routes),
    provideStore(reducers, { metaReducers }),
    provideState('auth', authReducer),
    provideState(serviceRequestFeature.name, serviceRequestFeature.reducer),
    provideState(userFeature.name, userFeature.reducer),
    provideStoreDevtools({
      maxAge: 25,
      logOnly: !isDevMode(),
      autoPause: true,
      trace: false,
      traceLimit: 75,
    }),
    provideRouterStore(),
    provideEffects([AuthEffects, AppEffects, ServiceRequestEffects, UserEffects]),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeAuth,
      deps: [AuthService],
      multi: true,
    },
    {
      provide: APP_INITIALIZER,
      useFactory: initializeIconify,
      multi: true,
    }, provideServiceWorker('ngsw-worker.js', {
            enabled: !isDevMode(),
            registrationStrategy: 'registerWhenStable:30000'
          }), provideServiceWorker('ngsw-worker.js', {
            enabled: !isDevMode(),
            registrationStrategy: 'registerWhenStable:30000'
          }),
  ],
};
