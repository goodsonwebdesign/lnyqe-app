import { AuthConfig } from '@auth0/auth0-angular';
import { environment } from '../../../environments/environment';

/**
 * Simple Auth0 configuration
 * 
 * This is a simplified configuration for development purposes.
 */
export const AUTH_CONFIG: AuthConfig = {
  domain: 'dev-j6xaaxargtg5y78x.us.auth0.com',
  clientId: 'jaxCqNsBtZmpnpbjXBsAzYkhygDKg4TM',
  
  // Auth parameters
  authorizationParams: {
    redirect_uri: window.location.origin + '/callback',
    scope: 'openid profile email'
  },
  
  // Simplify configuration for development
  skipRedirectCallback: false,
  cacheLocation: 'memory',
  useRefreshTokens: false, // Simpler token handling for development
  
  // HTTP API protection
  httpInterceptor: {
    allowedList: [
      {
        uri: `${environment.apiUrl}/*`
      }
    ]
  }
};
