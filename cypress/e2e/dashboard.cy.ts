// cypress/e2e/dashboard.cy.ts
describe('Dashboard Page', () => {
  beforeEach(() => {
    // Mock authentication if needed
    // cy.intercept('GET', '/api/auth/user', { fixture: 'user.json' }).as('getUser');
    
    // Visit the dashboard page
    cy.visit('/dashboard');
    
    // Wait for the dashboard to load
    cy.get('[data-testid=dashboard-container]', { timeout: 10000 }).should('be.visible');
  });

  it('should display the dashboard with all main sections', () => {
    // Check for the presence of main sections
    cy.getByTestId('dashboard-mobile-nav').should('be.visible');
    cy.getByTestId('dashboard-quick-actions').should('be.visible');
    
    // Verify the overview section is active by default
    cy.getByTestId('dashboard-section-overview').should('be.visible');
  });

  it('should navigate between sections', () => {
    // Click on the Tasks section button
    cy.getByTestId('nav-tasks-button').click();
    
    // Verify Tasks section is now visible
    cy.getByTestId('dashboard-section-tasks').should('be.visible');
    
    // Click on the Schedule section button
    cy.getByTestId('nav-schedule-button').click();
    
    // Verify Schedule section is now visible
    cy.getByTestId('dashboard-section-schedule').should('be.visible');
  });

  it('should show admin section if user has admin role', () => {
    // Mock admin user if using intercepted requests
    // cy.intercept('GET', '/api/auth/user', { fixture: 'admin-user.json' }).as('getAdminUser');
    // cy.reload();
    // cy.wait('@getAdminUser');
    
    // Click on Admin section button
    cy.getByTestId('nav-admin-button').click();
    
    // Verify Admin section is now visible
    cy.getByTestId('dashboard-section-admin').should('be.visible');
    cy.getByTestId('admin-actions').should('be.visible');
  });

  it('should trigger actions when quick action buttons are clicked', () => {
    // Spy on window.alert which might be used to show feedback in tests
    const alertStub = cy.stub().as('alertStub');
    cy.on('window:alert', alertStub);
    
    // Click on New Task button
    cy.getByTestId('create-task-button').click();
    
    // Verify that clicking the button had the expected effect
    // This might be a redirect, an opened modal, or some other visual change
    cy.getByTestId('task-creation-feedback').should('contain.text', 'Task creation started');
    
    // Click on Schedule button
    cy.getByTestId('schedule-event-button').click();
    
    // Verify expected behavior
    cy.getByTestId('schedule-creation-feedback').should('contain.text', 'Event scheduling started');
  });

  it('should display correct system status indicators', () => {
    // Check that system status section exists
    cy.getByTestId('system-status-section').should('be.visible');
    
    // Verify that statuses have the correct styling based on their state
    cy.getByTestId('status-online').should('have.class', 'bg-green-100');
    cy.getByTestId('status-maintenance').should('have.class', 'bg-amber-100');
  });
});