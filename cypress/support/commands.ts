// cypress/support/commands.ts
// Custom commands for Cypress tests

// Example of a custom command for login
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.get('[data-testid=email-input]').type(email);
  cy.get('[data-testid=password-input]').type(password);
  cy.get('[data-testid=login-button]').click();
});

// Helper command to get elements by test ID
Cypress.Commands.add('getByTestId', (testId: string) => {
  return cy.get(`[data-testid=${testId}]`);
});