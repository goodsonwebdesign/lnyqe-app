import { environment } from '../../../../environments/environment';
import { AuthConfig } from '@auth0/auth0-angular';

/**
 * Auth0 Configuration
 */
export const AUTH_CONFIG: AuthConfig = {
  domain: environment.auth.domain,
  clientId: environment.auth.clientId,

  // Auth parameters
  authorizationParams: {
    redirect_uri: window.location.origin + '/callback',
    scope: environment.auth.scope,
    audience: environment.auth.apiAudience,
  },

  // Token configuration
  useRefreshTokens: true,
  cacheLocation: 'memory',

  // HTTP API protection
  httpInterceptor: {
    allowedList: [
      {
        uri: `${environment.apiUrl}/*`,
        // The interceptor will use the root-level authorizationParams by default,
        // so tokenOptions are not needed here unless overriding.
      },
    ],
  },
};
