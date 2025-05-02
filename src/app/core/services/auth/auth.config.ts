import { AuthConfig } from '@auth0/auth0-angular';
import { environment } from '../../../environments/environment';

// Auth0 configuration - simplified to minimize state errors
export const AUTH_CONFIG: AuthConfig = {
  domain: 'dev-j6xaaxargtg5y78x.us.auth0.com',
  clientId: 'jaxCqNsBtZmpnpbjXBsAzYkhygDKg4TM',
  authorizationParams: {
    redirect_uri: window.location.origin,
    scope: 'openid profile email',
    appState: { target: '/dashboard' }
  },
  cacheLocation: 'localstorage',
  useRefreshTokens: true,
  httpInterceptor: {
    allowedList: []
  },
  // Add these to improve reliability
  skipRedirectCallback: true,
  errorPath: '/',
  // Use form data only in development - ensure secure origin in production
  useFormData: !environment.production
};
