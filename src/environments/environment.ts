export const environment = {
  production: false,
  // Add a build timestamp for cache invalidation
  buildTimestamp: new Date().getTime(),

  // Auth0 settings
  auth: {
    domain: 'dev-j6xaaxargtg5y78x.us.auth0.com',
    clientId: 'jaxCqNsBtZmpnpbjXBsAzYkhygDKg4TM',
    apiAudience: 'https://api.lynqe.com', // Use a single, clear audience for the API
    scope: 'openid profile email offline_access',
  },

  // API configuration
  apiUrl: '/api',

  // Vite options to prevent URI issues
  viteOptions: {
    // Set to true to disable URI decoding in routing
    disableUriDecoding: true,

    // Use simple URL parsing to avoid decodeURI calls
    useSimpleUrlParsing: true,

    // Disable automatic query parameter parsing
    disableQueryParsing: true,
  },
};
