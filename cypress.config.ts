import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:4200',
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.ts',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotsFolder: 'cypress/screenshots',
    videosFolder: 'cypress/videos',
  },
  component: {
    devServer: {
      framework: 'angular',
      bundler: 'vite',
    },
    specPattern: 'cypress/component/**/*.cy.ts',
    viewportWidth: 1280,
    viewportHeight: 720,
  },
});