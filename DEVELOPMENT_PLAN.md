# LNYQE Application Development Plan

## 1. Guiding Principles

This plan synthesizes the `CODING_STANDARDS.md` and `design-doc.txt` to provide a singular, actionable roadmap. All development must adhere to the following core principles:

- **Architecture**: A strict, feature-based modular architecture is mandatory.
    - **Structure**: Adhere to the `core`, `features`, `shared`, and `layouts` directory structure.
    - **Modularity**: All features must be implemented in lazy-loaded, standalone components.
    - **Component Pattern**: Strictly enforce the **Smart (Container) / Dumb (Presentational)** pattern. Containers manage state and data fetching, while presentational components are pure, receiving data via `@Input()` and emitting events via `@Output()`.
    - **Component File Structure**: Every component must include four distinct files: a template (`.html`), a stylesheet (`.scss`), the component logic (`.ts`), and a corresponding unit test file (`.spec.ts`). This ensures a consistent and complete structure for all components.
    - **State Management**: Use NgRx for global state and Signals for local, component-level state.
    - **Separation of Concerns**: Externalize all models, configurations, and constants into dedicated files (e.g., `feature.models.ts`, `feature.config.ts`) to keep components clean.
    - **API Abstraction Layer**: Insulate the application from backend data structures by using a dedicated repository or adapter layer. This layer is responsible for fetching data and transforming it into clean, frontend-specific view models, ensuring a stable contract for the UI components.
    - **Dependency Injection**: Use the `inject()` function for all dependency injection to maintain consistency and improve testability.

- **User Experience (UX) & Accessibility (a11y)**: The application must be intuitive, accessible, and visually consistent.
    - **Design**: Implement a mobile-first, responsive design using TailwindCSS utility classes.
    - **Accessibility**: Ensure WCAG AA compliance by using semantic HTML, ARIA attributes, and providing full keyboard navigability. All UI components must be designed with accessibility as a primary requirement.
    - **Theming**: A reactive theme service must support both light and dark modes, automatically responding to user system preferences and providing a manual toggle.
    - **Error Handling**: Implement a universal error handling service to provide consistent, user-friendly feedback for all API errors and application exceptions.

- **Performance**: Build for speed and efficiency to ensure a fluid user experience.
    - **Lazy & Deferred Loading**: Lazy-load all feature modules. Use the `@defer` block to defer-load heavy components (e.g., charts, complex widgets) until they are visible in the viewport.
    - **Image Optimization**: Use the `NgOptimizedImage` directive for all images and include `<link rel="preconnect">` tags for external image origins in `index.html` to prioritize loading.
    - **Change Detection**: Default to `OnPush` change detection for all components to minimize re-rendering cycles.
    - **State Management**: Prevent memory leaks by cleaning up subscriptions and resetting NgRx state slices when components are destroyed (e.g., clearing a `loading` flag).

- **Code Quality & Maintainability**: Write clean, readable, and robust code that is easy to test and refactor.
    - **Strict Typing**: The `any` type is forbidden. All variables, function parameters, and return types must be explicitly typed using specific models and interfaces.
    - **Signals for State**: Use Angular Signals for component-level state. Adopt `input.required<T>()` for all presentational component inputs to ensure clear contracts.
    - **Modern Control Flow**: Use the built-in `@for` and `@if` control flow syntax in templates. The `*ngFor` and `*ngIf` directives are deprecated.
    - **Template Safety**: Never bind a signal or an observable directly to a component input that expects a raw value. Always unwrap the value first by invoking the signal (`mySignal()`) or using the `async` pipe (`myObservable$ | async`).
    - **Robust Testing**:
        - Simulate real user interactions in tests (`dispatchEvent`). Do not call component methods directly.
        - Use `fixture.componentRef.setInput()` for signal inputs.
        - Properly mock all services and dependencies.
    - **Immutability**: Treat data as immutable. Use `readonly` properties and avoid mutating `@Input()` data.

- **Security**: A security-first mindset must be applied throughout the development lifecycle.
    - **Authentication**: Use the `auth0-angular` SDK for robust, token-based authentication. Secure all necessary routes with the `AuthGuard`.
    - **API Communication**: Use an `HttpInterceptor` to automatically attach authentication tokens to all outgoing API requests.
    - **Error Handling**: Ensure that services re-throw original errors to preserve stack traces for effective debugging, but never expose sensitive error details to the end-user.
    - **Code Hygiene**: Remove all debug code, console logs, and test-specific logic (e.g., hardcoded tokens) from production builds.

- **Automated Quality & Security Gates**: The CI/CD pipeline is the ultimate guardian of code quality and must be strictly enforced.
    - **CI/CD Enforcement**: All code must pass automated checks in the CI/CD pipeline before being eligible for merging. This includes, at a minimum, linting, unit tests with sufficient coverage, and a successful build.
    - **Pre-commit Hooks**: Utilize local pre-commit hooks (e.g., Husky) to run linters and tests, providing immediate feedback to developers and preventing broken code from entering the repository.
    - **Dependency Audits**: Regularly run automated security audits on third-party dependencies to identify and remediate vulnerabilities.

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

### Phase 6: Dashboard Overhaul (In Progress)

- **Objective**: Rework the primary dashboard into a highly customizable, performant, and user-centric hub for all application activities. The new design will be based on a widget-based, drag-and-drop grid system with a central ribbon bar for actions.
- **Core Technologies**:
    - **Grid System**: `angular-gridster2` for a dynamic, resizable, and draggable grid layout.
    - **Data Visualization**: `ngx-charts` for creating modular and interactive charts and graphs.
- **Tasks**:
    1.  **Foundation**:
        - Remove the previous dashboard implementation while preserving routing.
        - Install and configure `angular-gridster2` and `ngx-charts`.
        - Create a new `DashboardContainerComponent` to host the grid.
    2.  **Core UI Components**:
        - Develop a `RibbonComponent` to house primary user actions, inspired by familiar interfaces like Microsoft Outlook.
        - Create a generic `DashboardWidgetComponent` to serve as a standardized wrapper for all dashboard widgets, handling resize and interaction logic.
    3.  **Widget Development (Iterative)**:
        - Re-implement existing functionality (user tasks, messages, etc.) as individual, self-contained widgets.
        - Develop new data visualization widgets (e.g., performance charts, activity graphs).
    4.  **State Management (NgRx)**:
        - Define state for managing the dashboard layout (widget positions, sizes).
        - Ensure widget-specific state is handled cleanly within their respective feature stores.
    5.  **Responsiveness & Performance**:
        - Ensure the grid and all widgets are fully responsive and optimized for mobile devices.
        - Profile and optimize the performance of the dashboard, especially with a large number of widgets.
