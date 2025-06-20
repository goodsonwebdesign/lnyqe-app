# LNYQE Application Development Plan

## 1. Guiding Principles

This plan synthesizes the `CODING_STANDARDS.md` and `design-doc.txt` to provide a singular, actionable roadmap. All development must adhere to the following core principles:

- **Architecture**: A strict feature-based modularity using Standalone Components, NgRx for state management, and a `core`/`features`/`shared`/`layouts` structure.
- **User Experience**: A mobile-first design approach, ensuring intuitive navigation, accessibility (WCAG AA), and consistent theming (including mandatory dark mode support).
- **Performance**: Optimized for fast load times (FCP/TTI) through lazy loading, `OnPush` change detection, and efficient rendering strategies.
- **Code Quality**: High standards for code consistency, readability, and maintainability, enforced through linting, PR reviews, and comprehensive testing (80% unit test coverage minimum).
- **Security**: Adherence to OWASP best practices, including secure authentication, input validation, and protection against common vulnerabilities.

---

## 2. Development Phases

### Phase 1: Project Foundation & CI/CD

- **Objective**: Establish a robust and automated foundation for the project.
- **Tasks**:
    - **Directory Structure**: Confirm the `core`, `features`, `shared`, `store`, and `layouts` directories are in place.
    - **Configuration**: Set up base configurations for TailwindCSS (`tailwind.config.js`) with the project's color scheme, fonts, and spacing.
    - **CI/CD Pipeline**: Configure a CI pipeline (e.g., GitHub Actions) to automatically run on every push/PR:
        - Linting (`ng lint`)
        - Unit Tests (`ng test`)
        - E2E Tests (`cypress run`)
        - Build (`ng build`)
    - **Environment**: Ensure `environment.ts` and `environment.prod.ts` are configured for API endpoints and Auth0 settings.

### Phase 2: Core Infrastructure

- **Objective**: Build the essential, non-feature-specific parts of the application.
- **Tasks**:
    - **Authentication**: 
        - Implement Auth0 authentication using the `auth0-angular` SDK.
        - Create `AuthGuard` to protect routes.
        - Implement an `HttpInterceptor` to attach JWTs to API requests.
        - Mock auth services for testing purposes.
        - Verified and refined the post-login user profile fetching and NgRx store update mechanism.
        - Removed development-specific logging from authentication services, guards, and effects.
    - **State Management (NgRx)**: 
        - Initialize the root NgRx store.
        - Define the initial global state structure.
        - Ensured reliable update of authentication state (user, token, isAuthenticated) in the NgRx store after login.
    - **Layouts & Core UI**: 
        - Create main application layouts (e.g., a primary layout with navigation and a simple layout for auth pages).
        - Develop a core set of shared, reusable, and accessible UI components (buttons, inputs, modals) in the `/shared` directory.
    - **Core Services**:
        - Develop singleton services (`providedIn: 'root'`) for logging, error handling, and API communication.

### Phase 3: Feature Development (Iterative Cycle)

- **Objective**: Build and integrate individual application features in a consistent and scalable manner.
- **For each new feature, follow these steps**:
    1.  **Module**: Create a new, lazy-loaded directory in `/features`.
    2.  **Components**: 
        - Build components using the **Standalone Components** pattern.
        - Adhere to the **Smart (Container) / Dumb (Presentational)** pattern. Container components manage state and logic, while presentational components handle the UI.
    3.  **State (NgRx)**: 
        - Define feature-specific state, actions, reducers, effects, and selectors.
        - Use facade services to simplify component interaction with the store.
    4.  **Styling**: Use TailwindCSS utility classes, ensuring mobile-first responsiveness and dark mode support (`dark:`).
    5.  **Testing**:
        - Write unit tests for all new components, services, and NgRx logic, aiming for >80% coverage.
        - Write Cypress E2E tests for the feature's critical user flows, using `data-testid` attributes for reliable element selection.

### Phase 4: Quality Assurance & Optimization

- **Objective**: Ensure the application is performant, secure, and bug-free before release.
- **Tasks**:
    - **Performance Audit**: Profile the application using Lighthouse and Angular DevTools. Optimize bundle sizes, check for memory leaks, and ensure smooth rendering.
    - **Security Review**: Conduct a review against OWASP Top 10. Verify that all security standards from the documentation are met.
    - **Cross-Browser/Device Testing**: Manually test critical flows on major browsers (Chrome, Firefox, Safari) and mobile devices.
    - **Documentation Review**: Ensure all public APIs, component inputs/outputs, and complex logic are documented with JSDoc comments.

### Phase 5: Release & Deployment

- **Objective**: Deploy the application reliably and maintain a clear version history.
- **Tasks**:
    - **Versioning**: Use Semantic Versioning (Major.Minor.Patch) for all releases.
    - **Changelog**: Maintain a `CHANGELOG.md` file to document changes in each release.
    - **Deployment**: Use the documented deployment process, including running production builds and deploying to the target environment.
