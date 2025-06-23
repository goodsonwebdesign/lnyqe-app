import { routes } from './app.routes';
import { AUTH_CONFIG } from './core/services/auth/auth.config';
import { AuthService } from './core/services/auth/auth.service';
import { setupIconify } from './shared/utils/iconify';
import { AppEffects } from './store/effects/app.effects';
import { AuthEffects } from './store/effects/auth.effects';
import { ServiceRequestEffects } from './store/effects/service-request.effects';
import { UserEffects } from './store/effects/user.effects';
import { authFeature } from './store/reducers/auth.reducer';
import { serviceRequestFeature } from './store/reducers/service-request.reducer';
import { userFeature } from './store/reducers/user.reducer';
import { HttpClientModule } from '@angular/common/http';
import { APP_INITIALIZER, ApplicationConfig, importProvidersFrom, isDevMode } from '@angular/core';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { CorsInterceptor } from './core/interceptors/cors.interceptor';
import { HttpErrorInterceptor } from './core/interceptors/http-error.interceptor';
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
    return new Promise<void>((resolve) => {
      if (window.location.pathname === '/callback') {
        resolve();
        return;
      }

      // Check auth state and dispatch appropriate action
      authService
        .isAuthenticated()
        .pipe(take(1))
        .subscribe({
          next: () => {
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
            provideStore(), // Root store setup
    // Register all state slices as features for a consistent, modern setup
    provideState(authFeature),
    provideState(userFeature),
    provideState(serviceRequestFeature),
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
      provide: HTTP_INTERCEPTORS,
      useClass: CorsInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpErrorInterceptor,
      multi: true,
    },
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
    },
    provideServiceWorker('ngsw-worker.js', {
            enabled: !isDevMode(),
            registrationStrategy: 'registerWhenStable:30000'
          }),
  ],
};
