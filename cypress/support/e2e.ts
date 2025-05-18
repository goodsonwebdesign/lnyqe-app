// cypress/support/e2e.ts
// Import commands.js using ES2015 syntax:
import './commands';

// Alternatively, load commands from a custom commands file
// import './commands';

// Custom commands should be added to commands.ts

declare global {
  namespace Cypress {
    interface Chainable {
      // Custom commands can be defined here
      login(email: string, password: string): Chainable<void>;
      getByTestId(testId: string): Chainable<JQuery<HTMLElement>>;
    }
  }
}