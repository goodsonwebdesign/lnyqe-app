import { defineConfig } from 'vite';
import { Plugin } from 'vite';
// Update the import path to ensure we're using the correct environment file
import { environment } from './src/environments/environment';

/**
 * Custom plugin to safely handle URI parsing and prevent malformed URI errors
 */
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
            if (process.env['NODE_ENV'] !== 'production') {
        const originalDecodeURI = global.decodeURI;
        global.decodeURI = function safeDecodeURI(encodedURI: string): string {
          try {
            return originalDecodeURI(encodedURI);
          } catch {
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
    },
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        secure: false,
        changeOrigin: true,
        logLevel: 'debug'
      }
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
    safeDecodeUriPlugin()
  ]
});
