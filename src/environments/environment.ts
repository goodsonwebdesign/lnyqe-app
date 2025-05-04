export const environment = {
  production: false,
  // Add a build timestamp to force cache invalidation
  buildTimestamp: new Date().getTime(),

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
