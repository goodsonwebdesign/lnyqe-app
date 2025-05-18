import { defineConfig } from 'vite';
import { Plugin } from 'vite';
// Update the import path to ensure we're using the correct environment file
import { environment } from './src/environments/environment';

/**
 * Custom plugin to safely handle URI parsing and prevent malformed URI errors
 */
function safeUriPlugin(): Plugin {
  return {
    name: 'safe-uri-handling',
    configureServer(server) {
      // Add a middleware that runs before Vite's internal middleware
      server.middlewares.use((req, res, next) => {
        // Skip processing or sanitize URLs with problematic characters
        if (req.url && (req.url.includes('%') || req.url.includes('+'))) {
          console.warn('Potentially problematic URL detected:', req.url);

          // Remove query parameters which often contain special characters
          const url = req.url.split('?')[0];
          req.url = url;

          // Also override the URL parsing function to prevent errors
          const originalParseUrl = req.parseUrl;
          req.parseUrl = function safeParseUrl() {
            try {
              return originalParseUrl.call(this);
            } catch (err) {
              console.warn('URL parsing error suppressed');
              return {
                pathname: url || '/',
                search: '',
                query: {},
                raw: ''
              };
            }
          };
        }

        next();
      });
    }
  };
}

/**
 * Plugin to override global decodeURI function to prevent errors
 */
function safeDecodeUriPlugin(): Plugin {
  return {
    name: 'safe-decode-uri',
    enforce: 'pre',
    apply: 'serve',
    configResolved() {
      // Only override during development
      if (process.env.NODE_ENV !== 'production') {
        const originalDecodeURI = global.decodeURI;
        global.decodeURI = function safeDecodeURI(encodedURI: string): string {
          try {
            return originalDecodeURI(encodedURI);
          } catch (err) {
            console.warn('DecodeURI error prevented for:', encodedURI);
            return encodedURI; // Return the input unchanged instead of throwing
          }
        };
      }
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  // Use the environment options if available
  server: {
    fs: {
      strict: environment?.viteOptions?.disableUriDecoding ? false : true,
      allow: ['.']
    },
    hmr: {
      overlay: false, // Disable error overlay that can trigger URI issues
      timeout: 5000, // Increase timeout for HMR connections
      protocol: 'ws', // Use WebSocket protocol for more reliable connections
      clientPort: 4200 // Ensure client connects to the correct port
    },
    cors: true,
    host: 'localhost',
    watch: {
      usePolling: true, // More reliable file watching
      interval: 1000 // Check for changes every second
    }
  },
  resolve: {
    preserveSymlinks: true,
    dedupe: ['@angular/core', '@angular/common']
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true
    },
    sourcemap: environment.production ? false : true
  },
  optimizeDeps: {
    include: ['@angular/common', '@angular/core', '@auth0/auth0-angular']
  },
  plugins: [
    safeDecodeUriPlugin(),
    safeUriPlugin()
  ]
});
