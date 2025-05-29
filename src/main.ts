import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { bootstrapApplication } from '@angular/platform-browser';
import { inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { AuthActions } from './app/store/actions/auth.actions';

// Simple bootstrap without emergency fixes
bootstrapApplication(AppComponent, appConfig).then((ref) => {
  // Cypress E2E: Listen for ngrx-mock-auth event to set auth state in the store
  if (window && (window as any).Cypress) {
    const store = ref.injector.get(Store);
    window.addEventListener('ngrx-mock-auth', (event: any) => {
      const user = event.detail.user;
      // Provide a dummy token for the test
      const token = {
        accessToken: 'test-token',
        expiresIn: 3600,
        tokenType: 'Bearer',
        scope: 'openid profile email'
      };
      store.dispatch(AuthActions.loginSuccess({ user, token }));
      store.dispatch(AuthActions.setAuthState({ isAuthenticated: true }));
    });
  }
}).catch((err) => console.error(err));
