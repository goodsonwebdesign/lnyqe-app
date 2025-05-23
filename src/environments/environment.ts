export const environment = {
  production: false,
  // Add a build timestamp for cache invalidation
  buildTimestamp: new Date().getTime(),

  // API base URL for development with proxy
  apiUrl: '/api',
  
  // Previous direct API URLs (commented for reference)
  // apiUrl: 'http://lynqe-api-prod-1529662606.us-east-2.elb.amazonaws.com/api',
  // apiUrl: 'http://localhost:3000/api',

  // Add specific configurations to prevent URI malformed errors
  viteOptions: {
    // Set to true to disable URI decoding in routing
    disableUriDecoding: true,

    // Use simple URL parsing to avoid decodeURI calls
    useSimpleUrlParsing: true,

    // Disable automatic query parameter parsing
    disableQueryParsing: true
  }
};
