export const environment = {
  production: true,
  // Add a build timestamp for cache busting
  buildTimestamp: new Date().getTime(),

  // Production API URL
  apiUrl: 'https://api.lynqe.io',

  // Vite options for production
  viteOptions: {
    disableUriDecoding: true,
    useSimpleUrlParsing: true,
    disableQueryParsing: true
  }
};
