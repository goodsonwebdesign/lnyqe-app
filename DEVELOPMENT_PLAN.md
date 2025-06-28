# LNYQE Application Development Plan: The Single Source of Truth

**Version: 1.0** | **Last Updated: 2025-06-27**

## 1. Introduction

**THIS GUIDE MUST BE FOLLOWED AT ALL TIMES WITHOUT EXCEPTION.**

This document is the **definitive and single source of truth** for all development within the LNYQE application. It supersedes all previous planning and standards documents. Its purpose is to eliminate inconsistency and ensure every line of code adheres to the highest standards of quality, performance, and maintainability.

**Adherence to this plan is not optional.** It is the blueprint for building a sophisticated, scalable, and robust application.

### 1.1. Application Purpose & Vision

**The "Why": Providing the IT for the OT**

LNYQE (pronounced "link") was born from a simple necessity: to create the powerful, intuitive, and unified software that operations teams deserve. In many fields—from facilities management to project management, in both the private and public sectors—teams are forced to rely on a patchwork of disconnected, cumbersome, and ill-performing applications to manage their critical workflows.

This fragmentation leads to inefficiency, frustration, and anxiety. LNYQE exists to solve this. Our core mission is to be the **link** that brings everything together.

We are building a single, beautiful, and reliable platform to seamlessly manage:
- Workloads & Project Tracking
- User & Vendor Management
- Client & Contact Relationships
- Contracts & Documentation
- And much more, with a long-term vision to expand into HR, Finance, and other departments.

Every feature, design choice, and line of code in this project must serve our ultimate goal: **to empower users by removing pain points and making their work effortless.** The application must always be:

- **Powerful & Reliable**: Capable of handling complex workflows without failure.
- **Intuitive & Effortless**: Easy to learn and a pleasure to navigate, minimizing cognitive load.
- **Beautiful & Modern**: Delivering a user experience that is as aesthetically pleasing as it is functional.

---

To minimize errors and reduce rework, all developers **must** adhere to the following process:
1.  **Review Before Coding**: Before writing or modifying any code, thoroughly review all related files, components, services, and models to fully understand the context and potential impact of your changes.
2.  **Mandatory Self-Review**: After making any change, you are required to perform a thorough review of all edited files. This is not optional and serves as a critical quality gate before committing code.
3.  **Model Integrity**: Absolutely **NO** changes are to be made to data models (`src/app/core/models/**/*.model.ts`) without express permission. These models represent the data contract with the backend and must remain stable.
4.  **No Data Transformation Mismatches**: The use of client-side data transformation functions (e.g., `transformData`) to patch or alter the backend data contract is strictly forbidden. If a model from the backend does not fit the frontend's needs, the discrepancy must be discussed and resolved with the backend team. The frontend model must always be a true reflection of the API response.
5.  **Adherence to Scope**: No functionality is to be introduced without express permission. Unsolicited features lead to unnecessary refactoring, code bloat, and misalignment with backend capabilities. All development must be strictly aligned with the defined tasks and roadmap. If you believe a new feature is necessary, it must be proposed, discussed, and approved before any implementation begins.

---

## 2. The Developer's Non-Negotiable Pre-Commit Checklist

Before any `git commit` is made, every developer **must** verify their changes against this checklist. This is our first line of defense against inconsistency and technical debt.

**Code Quality & Structure**
- [ ] **No `any` type**: Have all `any` types been eliminated and replaced with specific interfaces or types?
- [ ] **Single Responsibility**: Does every function/method do only one thing and is it under the 30-line soft limit?
- [ ] **Immutability**: Is state from NgRx or services treated as `readonly`? Are you dispatching actions to update state rather than mutating data directly?
- [ ] **Naming Conventions**: Do all files, classes, methods, variables, and constants follow the official Angular Style Guide?
- [ ] **Styling**: Have TailwindCSS classes been auto-formatted by the Prettier plugin?
- [ ] **Code Readability**: Is all code (HTML, TypeScript) formatted cleanly, logically, and in a human-readable way? (e.g., no broken tags, consistent indentation).
- [ ] **Leverage Angular Features**: Have you researched and used Angular's powerful, built-in tools and best practices (e.g., data binding, interpolation, `async` pipe) to accomplish the task, rather than implementing a custom or less-efficient solution?
- [ ] **Holistic UI/UX Standards**: Does the component's UI/UX adhere to all styling guidelines? This includes being: **mobile-first, clean, modern, impactful, consistent, performant, distinctive, compliant (WCAG), and logical**. Does it fully support **light mode, dark mode, and system preferences**?

**Component Architecture**
- [ ] **Dumb Component Purity**: If this is a presentational component, is it **100% stateless** (i.e., contains no internal `signal()` declarations)?
- [ ] **Required Inputs**: Do all `@Input()`s on dumb components use `input.required<T>()`?
- [ ] **Typed Outputs**: Does every `@Output()` have a specific, typed payload interface (e.g., `EventEmitter<UserDeletePayload>`)?

**Accessibility & UX**
- [ ] **Keyboard Navigation**: Is the new feature or component fully and logically navigable using only the keyboard?
- [ ] **Focus Management**: If a modal/flyout was added, is focus correctly trapped and returned on close?
- [ ] **Semantic HTML & ARIA**: Are appropriate ARIA roles and attributes used? Is HTML semantic (`<nav>`, `<button>`, etc.)?
- [ ] **Image Alt Tags**: Does every `<img>` tag have a descriptive `alt` attribute?
- [ ] **Cognitive Ease & Intuition**: Is the UI intuitive and effortless to reason about? Does it follow established UX psychology principles (e.g., clear feedback, consistency, minimal cognitive load) to prevent user confusion or frustration?

**Testing**
- [ ] **Unit Tests**: Have unit tests been written for all new logic, achieving >80% coverage?
- [ ] **E2E Tests**: Have critical user flows been covered with Cypress E2E tests using `data-testid` selectors?
- [ ] **Mobile Compatibility**: Has the feature been thoroughly tested on mobile viewports to ensure full functionality and a seamless user experience?

---

## 3. Core Principles & Standards

### 3.1. Code Quality & Maintainability

- **Naming Conventions**: We strictly follow the [**Angular Style Guide**](https://angular.dev/guide/styleguide). This is enforced by the linter.
  - **Files**: `feature.component.ts`, `feature.service.ts`, etc.
  - **Classes/Interfaces**: `PascalCase`
  - **Methods/Properties**: `camelCase`
  - **Observables**: `camelCase$`
  - **Constants**: `UPPER_SNAKE_CASE`
- **Code Style**: We use a [**Prettier plugin for TailwindCSS**](https://github.com/tailwindlabs/prettier-plugin-tailwindcss) to automatically sort utility classes in a consistent, logical order. This is enforced via pre-commit hooks.
- **Single Responsibility Principle (SRP)**: Every function, method, or class must have one and only one reason to change. Functions **must not exceed a soft limit of 30 lines**. If they do, they must be refactored.
- **Strict Typing (No `any`)**: The `any` type is forbidden. All variables, function parameters, and return types must be explicitly and strongly typed.
- **Immutability**: Data must be treated as immutable.
  - **NgRx Reducers**: Must **never** mutate the `state` object. Always return a new state object using the spread syntax (`...state`).
  - **Services & Components**: Data selected from the store or returned from a service must be treated as `readonly`. To change data, an action must be dispatched to the store.

### 3.2. Architecture

- **Standalone Components**: All new components, directives, and pipes **must** be created as `standalone`. This is the default for the application and enforces a modular, `NgModule`-free architecture.
- **Application Directory Structure**: All code must be placed according to this structure. The `users-management` feature is the canonical example.
  ```
  src/
  └── app/
      ├── core/
      │   ├── guards/
      │   ├── interceptors/
      │   ├── models/ (Global models: user.model.ts, auth.model.ts)
      │   └── services/ (Singleton services: auth.service.ts, api.service.ts)
      ├── features/
      │   └── [feature-name]/ (e.g., users-management/)
      │       ├── components/ (Smart/Container components)
      │       ├── facades/ (Optional: feature.facade.ts)
      │       ├── store/ (actions, reducer, effects, selectors)
      │       ├── [feature-name].routes.ts
      │       └── [feature-name].types.ts
      ├── layouts/
      │   └── main-layout/
      └── shared/
          ├── components/ (Pure, dumb, reusable components: button, input)
          ├── directives/
          ├── pipes/
          └── utils/
  ```
- **Component Pattern: Smart (Container) / Dumb (Presentational)**
  - **Smart Components**: The only components that can inject services, facades, or the NgRx Store. They manage state and pass it down to dumb components.
  - **Dumb Components**: Must be **100% stateless**. Their state is derived entirely from `@Input()` signals. They are pure, reusable UI building blocks.
    - All `@Input()`s **must** use `input.required<T>()`.
    - All `@Output()`s **must** be strictly typed with a payload interface.
- **State Management**
  - **Global State (NgRx)**: For state shared across features (e.g., auth, user profile). We use `createFeature` for encapsulation and `createActionGroup` for actions.
  - **Component State (Signals)**: For state that is local and specific to a single component (e.g., a dropdown's open/closed status), use Angular Signals. This state **must** reside in the Smart/Container component.
- **Optimistic Updates**: All data manipulation actions (create, update, delete) **must** be implemented optimistically in NgRx. The UI updates instantly, the API call is made in the background, and the state is rolled back on failure with a user notification.

### 3.3. User Experience & Accessibility (a11y)

- **WCAG AA Compliance**: All development must meet WCAG 2.1 AA standards.
- **Focus Management**: For dynamic UI (modals, flyouts), focus **must** be programmatically trapped and returned to the trigger element on close. The Angular CDK's `FocusTrap` is recommended.
- **Automated Testing**: We use **`axe-core`** integrated with Cypress E2E tests. Builds will fail on critical accessibility violations.
- **Global Search**: Key display elements (user names, item titles) must include the `data-searchable="true"` attribute to support a future global search feature.
- **User Feedback**: All asynchronous actions (API calls, background processes) that the user initiates **must** provide feedback on their status (e.g., success, failure, loading). A global toast/notification component must be used for this purpose to ensure consistency.

### 3.4. Testing

- **Unit Tests**: All components, services, and NgRx logic must have unit tests with **>80% code coverage**.
- **E2E Tests**: Critical user flows must be covered by Cypress E2E tests. Use `data-testid` attributes for reliable element selection, not CSS classes or tag names.

### 3.5. Mobile-Specific Interactions

- **Touch Gestures**: When implementing touch-based controls (e.g., swipe-to-delete), gestures must be intuitive, provide clear visual feedback, and have accessible, non-touch alternatives (e.g., a visible button).
- **Hardware Access (Camera, GPS, etc.)**: Access to device hardware must be requested with a clear, user-friendly explanation of why it's needed. The application must handle permission denial gracefully and provide alternative functionality where possible. All access must be implemented securely.

### 3.6. Code Hygiene & Refactoring

- **Dead Code Elimination**: Regularly inspect and remove any code that is unused, orphaned, or was created solely for debugging purposes. This must be done with extreme care and verification to ensure no active functionality is broken.
- **Continuous Refactoring**: Code is not static. Any method or component that no longer meets the standards outlined in this document, has become overly complex, or violates the SRP must be proactively refactored.
- **Core Dependency Audit**: Before and after refactoring any core service (`src/app/core/services/**`), shared module, or data model, a global search (`grep`) **must** be performed across the entire codebase. This is to identify every single usage and ensure all dependent components, services, and templates are updated accordingly. Failure to do so can lead to widespread compilation errors and runtime failures. This is a non-negotiable step for any significant architectural change.
- **Subscription Management**: All `subscribe()` calls must be managed to prevent memory leaks. Use `takeUntilDestroyed` from `@angular/core/rxjs-interop` as the default best practice in components and services.
- **Memory Leak Detection**: Be vigilant for potential memory leaks, especially those caused by subscriptions, detached DOM elements, or improper use of closures.
- **Test Coverage Verification**: Before considering a feature complete, verify that both unit tests (`>80%`) and critical path E2E tests are written and passing.
- **Test Data Management**: For complex components or services requiring mock data for testing, create a dedicated `*.test-data.ts` file within the component's directory. This keeps test data organized and reusable.

### 3.7. Implementation Plan

- **Current Goal**: Verify the complete authentication flow, including the user menu fix, and ensure logout is only triggered on genuine authentication failures.

- **Task List**:
    - [x] **Fix Auth Race Condition**: Refactored NgRx auth effects to split token storage and user profile fetching into sequential actions (`Set Auth Token` -> `Fetch User Profile`), preventing 401 errors from premature API calls.
    - [x] **Fix User Menu UI Bug**: Updated `UserService`'s `getMe()` method to robustly handle both nested (`{ user: ... }`) and direct (`...`) API responses, ensuring the user object is always correctly stored in the NgRx state.
    - [x] **Fix Infinite Loading Screen**: The `isAuthLoading` implementation was flawed, causing unauthenticated users to be stuck on a loading screen. The auth effects have been refactored to correctly handle both authenticated and unauthenticated states, ensuring the loading screen only shows when appropriate.
    - [x] **End-to-End Test**: Manually test the full login flow: Login -> Auth0 -> Callback -> Token Stored -> User Profile Fetched -> Dashboard & Header UI Updated.
    - [x] **Verify Logout Behavior**: Confirm that logout actions are only dispatched on genuine authentication failures or explicit user action, not as a result of the fixed race condition.

### User Management UI/UX

- [x] **Fix User Name Sync**: In the user edit flyout, the `name` field is not being updated when `first_name` or `last_name` are changed. The `name` property is now correctly recalculated (`firstName + ' ' + lastName`) before the update is dispatched, and the store is updated optimistically.

---

## 4. Development Phases & In-Progress Work

*(This section is preserved from the previous plan and will be updated as work progresses)*

### Phase 6: Dashboard Overhaul (In Progress)

- **Objective**: Rework the primary dashboard into a highly customizable, performant, and user-centric hub for all application activities. The new design will be based on a widget-based, drag-and-drop grid system with a central ribbon bar for actions.
- **Core Technologies**:
    - **Grid System**: `angular-gridster2` for a dynamic, resizable, and draggable grid layout.
    - **Data Visualization**: `ngx-charts` for creating modular and interactive charts and graphs.
- **Tasks**:
    1.  **Foundation**: Remove previous implementation, install dependencies, create `DashboardContainerComponent`.
    2.  **Core UI**: Develop `RibbonComponent` and generic `DashboardWidgetComponent`.
    3.  **Widget Development**: Re-implement existing functionality as widgets.
    4.  **State Management**: Define NgRx state for dashboard layout and widget data.
    5.  **Responsiveness & Performance**: Ensure the grid is responsive and performant.

---

## 5. Appendix: External Resources

- [**Angular Style Guide**](https://angular.dev/guide/styleguide)
- [**WCAG 2.1 Guidelines**](https://www.w3.org/TR/WCAG21/)
- [**axe-core Documentation**](https://github.com/dequelabs/axe-core)
- [**NgRx Style Guide**](https://ngrx.io/guide/styleguide)

