export const environment = {
  production: true,

  // Add specific configurations to prevent URI malformed errors
  viteOptions: {
    // Set to true to disable URI decoding in routing
    disableUriDecoding: true,

    // Use simple URL parsing to avoid decodeURI calls
    useSimpleUrlParsing: true,

    // Disable automatic query parameter parsing
    disableQueryParsing: true,
  },

  // API configuration
  apiUrl: '/api',

  // Default resource paths with no special characters
  resourcePaths: {
    images: 'assets/images',
    data: 'assets/data',
  },
};
