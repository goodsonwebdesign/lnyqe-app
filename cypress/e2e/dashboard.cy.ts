// cypress/e2e/dashboard.cy.ts
describe('Dashboard Page', () => {
  beforeEach(() => {
    // Set up test fixtures for various user roles
    cy.fixture('user.json').as('regularUser');
    cy.fixture('admin-user.json').as('adminUser');

    // Mock authentication with admin user by default
    cy.intercept('GET', '/api/auth/user', { fixture: 'admin-user.json' }).as('getUser');

    // Visit the dashboard page
    cy.visit('/dashboard');

    // Wait for the dashboard to load and API calls to complete
    cy.get('[data-testid=dashboard-container]', { timeout: 10000 }).should('be.visible');
    cy.wait('@getUser');
  });

  it('should display the dashboard with all main sections', () => {
    // Check for the presence of main sections using data-testid attributes
    cy.getByTestId('dashboard-mobile-nav').should('exist');
    cy.getByTestId('dashboard-quick-actions').should('exist');

    // Verify the overview section is visible - don't rely on it being the default
    // as this could change in the future
    cy.getByTestId('nav-overview-button').click();
    cy.getByTestId('dashboard-section-overview').should('be.visible');

    // Check that dashboard content has key elements regardless of mock data details
    cy.get('[data-testid^=stat-card-]').should('have.length.at.least', 1);
  });

  it('should navigate between sections', () => {
    // Click on the Tasks section button
    cy.getByTestId('nav-tasks-button').click();

    // Verify Tasks section is now visible and has task items
    cy.getByTestId('dashboard-section-tasks').should('be.visible');
    cy.get('[data-testid^=task-item-]').should('have.length.at.least', 1);

    // Click on the Schedule section button
    cy.getByTestId('nav-schedule-button').click();

    // Verify Schedule section is now visible and has schedule items
    cy.getByTestId('dashboard-section-schedule').should('be.visible');
    cy.get('[data-testid^=schedule-item-]').should('have.length.at.least', 1);
  });

  it('should show admin section if user has admin role', () => {
    // Verify the admin navigation button exists for admin users
    cy.getByTestId('nav-admin-button').should('exist');

    // Click on Admin section button
    cy.getByTestId('nav-admin-button').click();

    // Verify Admin section is now visible with admin-specific content
    cy.getByTestId('dashboard-section-admin').should('be.visible');
    cy.getByTestId('admin-actions').should('exist');
    cy.getByTestId('admin-overview-cards').should('exist');
  });

  it('should hide admin section for non-admin users', () => {
    // Switch to regular user
    cy.intercept('GET', '/api/auth/user', { fixture: 'user.json' }).as('getRegularUser');
    cy.reload();
    cy.wait('@getRegularUser');

    // Verify the admin navigation button doesn't exist for regular users
    cy.getByTestId('nav-admin-button').should('not.exist');

    // Verify the admin section is not accessible
    cy.getByTestId('dashboard-section-admin').should('not.exist');
  });

  it('should display and interact with quick actions', () => {
    // Intercept action API calls or events
    cy.intercept('POST', '/api/tasks/create').as('createTask');
    cy.intercept('POST', '/api/events/schedule').as('scheduleEvent');

    // Click on New Task button
    cy.getByTestId('createTask-button').click();

    // Wait for API call or check for UI change (like a modal appearing)
    cy.wait('@createTask').its('request.body').should('not.be.empty');
    // Or verify a modal opened
    cy.getByTestId('task-creation-modal').should('be.visible');

    // Close the modal if it opened
    cy.getByTestId('close-modal-button').click();

    // Click on Schedule button
    cy.getByTestId('scheduleEvent-button').click();

    // Verify expected behavior
    cy.wait('@scheduleEvent');
    cy.getByTestId('schedule-creation-modal').should('be.visible');
  });

  it('should display correct system status indicators', () => {
    // Check that system status section exists
    cy.getByTestId('system-status-section').should('be.visible');

    // Verify that statuses have the correct styling based on their state
    // Use attribute selectors to be resilient to class changes
    cy.getByTestId('status-online').should('have.attr', 'data-status', 'online');
    cy.getByTestId('status-maintenance').should('have.attr', 'data-status', 'maintenance');

    // Check that the status text is present, without relying on exact text content
    cy.getByTestId('status-online').find('.status-label').should('exist');
  });

  it('should handle theme switching', () => {
    // Find and click the theme switch button
    cy.getByTestId('theme-switch').click();

    // Verify the theme changed - check for a class on the body or a root element
    cy.get('body').should('have.class', 'dark-theme');

    // Toggle back
    cy.getByTestId('theme-switch').click();
    cy.get('body').should('not.have.class', 'dark-theme');
  });

  it('should handle data loading states', () => {
    // Test the loading state by delaying API responses
    cy.intercept('GET', '/api/dashboardData', (req) => {
      req.on('response', (res) => {
        res.setDelay(1000); // Delay by 1 second
      });
    }).as('slowData');

    // Reload to trigger the intercepted request
    cy.reload();

    // Verify loading states are shown
    cy.getByTestId('data-loading-indicator').should('be.visible');

    // Then verify they're hidden when data arrives
    cy.wait('@slowData');
    cy.getByTestId('data-loading-indicator').should('not.exist');
  });
});

// Add the following to cypress/support/commands.ts if it doesn't exist
/**
 * Custom command to select DOM elements by data-testid attribute.
 * This provides a more resilient way to select elements that won't break
 * if class names or DOM structure changes.
 *
 * @example cy.getByTestId('submit-button')
 */
Cypress.Commands.add('getByTestId', (testId) => {
  return cy.get(`[data-testid="${testId}"]`);
});
