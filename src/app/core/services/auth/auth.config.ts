import { AuthConfig } from '@auth0/auth0-angular';
import { environment } from '../../../environments/environment';

// Auth0 configuration
export const AUTH_CONFIG: AuthConfig = {
  domain: 'dev-j6xaaxargtg5y78x.us.auth0.com',
  clientId: 'jaxCqNsBtZmpnpbjXBsAzYkhygDKg4TM',
  authorizationParams: {
    redirect_uri: window.location.hostname === 'localhost'
      ? 'http://localhost:4200/callback'
      : 'https://lynqe.io/callback',
    scope: 'openid profile email'
  },
  skipRedirectCallback: true,
  cacheLocation: 'memory',
  useRefreshTokens: true,
  httpInterceptor: {
    allowedList: []
  }
};
