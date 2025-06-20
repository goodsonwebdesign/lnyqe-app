export const environment = {
  production: true,
  // Add a build timestamp for cache busting
  buildTimestamp: new Date().getTime(),

  // Auth0 settings
  auth: {
    domain: 'dev-j6xaaxargtg5y78x.us.auth0.com',
    clientId: 'jaxCqNsBtZmpnpbjXBsAzYkhygDKg4TM',
    audience: 'https://api.lynqe.com', // Updated to the correct API domain
    apiAudience: 'https://api.lynqe.com', // Added for CorsInterceptor consistency
    scope: 'openid profile email offline_access',
  },

  // Production API URL - make sure to include '/api' path
  apiUrl: 'http://lynqe-api-prod-1529662606.us-east-2.elb.amazonaws.com/api',

  // Vite options for production
  viteOptions: {
    disableUriDecoding: true,
    useSimpleUrlParsing: true,
    disableQueryParsing: true,
  },
};
