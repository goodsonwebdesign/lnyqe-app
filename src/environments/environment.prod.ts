export const environment = {
  production: true,
  // Add a build timestamp for cache busting
  buildTimestamp: new Date().getTime(),

  // Production API URL - make sure to include '/api' path
  apiUrl: "http://lynqe-api-prod-1529662606.us-east-2.elb.amazonaws.com/api",

  // Vite options for production
  viteOptions: {
    disableUriDecoding: true,
    useSimpleUrlParsing: true,
    disableQueryParsing: true
  }
};
