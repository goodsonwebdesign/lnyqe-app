import { AuthConfig } from '@auth0/auth0-angular';
import { environment } from '../../../environments/environment';

// Auth0 configuration - completely hardened against URI decoding issues
export const AUTH_CONFIG: AuthConfig = {
  domain: 'dev-j6xaaxargtg5y78x.us.auth0.com',
  clientId: 'jaxCqNsBtZmpnpbjXBsAzYkhygDKg4TM',
  authorizationParams: {
    redirect_uri: window.location.origin + '/callback', // Use string concatenation instead of template literals
    scope: 'openid profile email'
  },
  // Disable automatic redirect callback handling to prevent URI decoding issues
  skipRedirectCallback: true,
  // Use memory instead of localstorage to avoid any encoding issues with persisted data
  cacheLocation: 'memory',
  useRefreshTokens: true,
  httpInterceptor: {
    allowedList: []
  }
};
