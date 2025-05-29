// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.

export const environment = {
  production: false,

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
  apiUrl: 'http://localhost:3000/api',

  // Default resource paths with no special characters
  resourcePaths: {
    images: 'assets/images',
    data: 'assets/data',
  },
};
