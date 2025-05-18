# LNYQE Application Coding Standards

## Table of Contents
1. [Introduction](#introduction)
2. [Architecture Patterns](#architecture-patterns)
3. [State Management with NgRx](#state-management-with-ngrx)
4. [Performance Guidelines](#performance-guidelines)
5. [TailwindCSS Usage](#tailwindcss-usage)
6. [Theming Guidelines](#theming-guidelines)
7. [Angular Best Practices](#angular-best-practices)
8. [Security Standards](#security-standards)
9. [User Experience Principles](#user-experience-principles)
10. [Mobile-First Approach](#mobile-first-approach)
11. [Design Language](#design-language)
12. [Codebase Structure](#codebase-structure)
13. [Code Quality & Testing](#code-quality--testing)
14. [Documentation Standards](#documentation-standards)
15. [Development Workflow](#development-workflow)

## Introduction

This document outlines the coding standards and best practices for the LNYQE application. These standards aim to ensure consistency, maintainability, performance, and scalability across the codebase while providing an exceptional user experience.

Our application is built using Angular with NgRx for state management, TailwindCSS for styling, and follows a mobile-first approach with a modern design language.

## Architecture Patterns

We employ multiple architectural patterns to maximize performance and maintainability:

### Standalone Components

- Use standalone components as the default approach for all new components
- Standalone components must:
  - Have the `standalone: true` property in the component decorator
  - Import all dependencies directly in the component's `imports` array
  - Not be declared in NgModule declarations arrays
- For container components, import the presentational components directly:
  ```typescript
  @Component({
    selector: 'app-feature-container',
    template: `<app-feature [data]="data$ | async"></app-feature>`,
    standalone: true,
    imports: [CommonModule, FeatureComponent]
  })
  export class FeatureContainerComponent {}
  ```
- For lazy loading standalone components:
  ```typescript
  {
    path: 'feature',
    loadComponent: () => import('./feature.component').then(m => m.FeatureComponent)
  }
  ```
- When using NgRx with standalone components, create a dedicated providers configuration:
  ```typescript
  export const featureProviders = [
    provideState(featureFeature),
    provideEffects(FeatureEffects)
  ];
  ```

### Smart and Dumb Components

- **Smart (Container) Components**:
  - Manage data retrieval and state
  - Connect to the NgRx store
  - Handle business logic
  - Rarely contain styles
  - Always suffixed with `-container`, e.g., `dashboard-container.component.ts`

- **Dumb (Presentational) Components**:
  - Focused on UI rendering
  - Receive data via inputs and emit events via outputs
  - No direct connection to services or store
  - Highly reusable
  - No suffix needed, e.g., `dashboard.component.ts`

### Module Federation

- Break large features into self-contained modules
- Lazy load feature modules to reduce initial load time
- Configure appropriate preloading strategies based on user journey analytics

### Facade Pattern

- Use facade services to abstract complex subsystems
- Place facades in a dedicated `/facades` directory within feature modules
- Example pattern:

```typescript
@Injectable()
export class UserFacade {
  constructor(private store: Store, private userService: UserService) {}

  // Simple API for components
  getUser(id: string): Observable<User> {
    return this.store.select(selectUserById(id));
  }

  loadUser(id: string): void {
    this.store.dispatch(loadUser({ id }));
  }
}
```

### Observer Pattern (Reactive Programming)

- Use Observables for handling async operations
- Always use the async pipe in templates to avoid manual subscription management
- Complete all observables when components are destroyed

### Factory Pattern

- Implement factories for creating complex objects
- Place factories in a `/factories` directory within appropriate modules

### Singleton Pattern

- Use Angular's dependency injection for service singletons
- Specify `providedIn: 'root'` for application-wide services
- Use feature module providers for module-specific services

### Adapter Pattern

- Create adapters for external API integrations
- Place adapters in a `/adapters` directory within appropriate modules
- Keep data transformations isolated from business logic

### MVC Pattern

- Follow Angular's built-in MVC pattern:
  - Model: NgRx state, interfaces, and domain models
  - View: Component templates
  - Controller: Component classes and services

## State Management with NgRx

### Store Organization

- Structure store by feature (not by entity type)
- Keep related actions, reducers, selectors, and effects together
- Utilize NgRx's createFeature function for better encapsulation

### Actions

- Use the createActionGroup API for related actions:

```typescript
export const UserActions = createActionGroup({
  source: 'User',
  events: {
    'Load Users': emptyProps(),
    'Load Users Success': props<{ users: User[] }>(),
    'Load Users Failure': props<{ error: any }>(),
  }
});
```

- Name actions using past tense for events that occurred ("User Loaded") and imperative mood for commands ("Load User")

### Selectors

- Create reusable, composable selectors
- Memoize complex selectors using createSelector
- Create view models in selectors, not in components:

```typescript
export const selectUserViewModel = createSelector(
  selectUserState,
  selectPreferences,
  (user, preferences) => ({
    displayName: user.firstName + ' ' + user.lastName,
    theme: preferences.theme,
    isAdmin: user.roles.includes('admin')
  })
);
```

### Effects

- Keep effects simple and focused on a single responsibility
- Use the `switchMap` operator for cancellable requests
- Use the `concatMap` operator for sequential, non-cancellable requests
- Use the `mergeMap` operator for parallel, non-cancellable requests
- Include error handling for all API calls

### Entity Adapter

- Use NgRx Entity for collections of data
- Normalize nested data structures
- Define ID selectors consistently

## Performance Guidelines

### Change Detection

- Use OnPush change detection strategy for all components
- Use immutable data patterns with NgRx to leverage OnPush efficiency
- Avoid direct DOM manipulation; use Angular's binding system

### Bundle Size

- Lazy load all feature modules
- Use dynamic imports for large third-party libraries
- Regularly audit bundle size with tools like Webpack Bundle Analyzer

### Rendering Performance

- Virtualize long lists using @angular/cdk/scrolling
- Use trackBy with ngFor to optimize list rendering
- Avoid expensive computations in templates; use pure pipes instead

### Memory Management

- Unsubscribe from all Observables in ngOnDestroy
- Prefer async pipe to manage subscriptions automatically
- Avoid creating large closure scopes in callbacks

### Network Optimization

- Implement HTTP request caching for appropriate resources
- Use HTTP interceptors for common request handling
- Configure appropriate cache headers for static assets

## TailwindCSS Usage

### Class Organization

- Order Tailwind classes consistently:
  1. Layout (display, position)
  2. Box model (width, height, margin, padding)
  3. Typography
  4. Visual (colors, backgrounds)
  5. Interactive elements (hover, focus)

Example:
```html
<div class="flex justify-between items-center w-full p-4 text-sm font-medium text-neutral-800 dark:text-neutral-200 bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700">
```

### Utility First

- Use utility classes directly in templates rather than creating custom CSS
- Extract common patterns to components, not CSS classes
- Create design system components for reusable UI elements

### Custom Components

- Create UI components for common patterns:
  - Buttons
  - Cards
  - Form inputs
  - Modal dialogs

### Responsive Design

- Use Tailwind's responsive prefixes consistently
- Default to mobile design, then use `sm:`, `md:`, `lg:` breakpoints
- Test all components across breakpoints

### Dark Mode

- Support dark mode for all components using Tailwind's `dark:` prefix
- Test all components in both light and dark mode

## Theming Guidelines

### Color Palette

- Use semantic color variables throughout the application
- Define all colors in tailwind.config.js
- Use color variants consistently (primary-50 through primary-900)

### Theme Variables

- Define a consistent set of variables for:
  - Colors
  - Typography
  - Spacing
  - Border radius
  - Box shadows

### Theme Switching

- Support both light and dark themes
- Persist theme preference in user settings
- Respect user's system preference for initial theme

### Accessibility

- Maintain sufficient contrast ratios (WCAG AA compliance minimum)
- Test color choices with colorblindness simulators
- Use relative units (rem) for font sizes

## Angular Best Practices

### Component Structure

- Follow a consistent file organization within components:
  ```
  /feature
    feature.component.ts        // Component logic
    feature.component.html      // Template
    feature.component.scss      // Component-specific styles
    feature.component.spec.ts   // Tests
    feature.types.ts            // Types and interfaces
  ```

### Lifecycle Hooks

- Keep initialization logic in ngOnInit
- Clean up in ngOnDestroy
- Avoid using lifecycle hooks for logic that can be reactive

### Template Best Practices

- Keep templates simple and focused
- Avoid complex logic in templates; move to component methods or pipes
- Use ng-container for structural directives to avoid extra DOM elements

### Form Handling

- Use Reactive Forms for complex forms
- Implement form validation consistently
- Create reusable form controls for common inputs

### Dependency Injection

- Follow the Angular DI pattern consistently
- Inject services in the constructor
- Use appropriate provider scope

## Security Standards

### Authentication and Authorization

- Implement OAuth 2.0 / OpenID Connect for authentication
- Use JWT tokens with appropriate expiration
- Store tokens securely (HttpOnly cookies preferred)
- Implement role-based access control

### Data Protection

- Never store sensitive information in localStorage or sessionStorage
- Encrypt sensitive data in transit and at rest
- Implement CSRF protection

### Input Validation

- Validate all user inputs on both client and server
- Use Angular's built-in sanitization for HTML content
- Avoid direct DOM manipulation with user input

### API Security

- Implement rate limiting
- Use HTTPS for all API communications
- Validate API responses before processing

## User Experience Principles

### Consistent Patterns

- Use consistent interaction patterns throughout the app
- Maintain predictable navigation
- Make user confirmation dialogs consistent

### Feedback

- Provide immediate feedback for user actions
- Show loading states for asynchronous operations
- Use clear error messages that suggest solutions

### Accessibility (A11y)

- Support keyboard navigation
- Include proper ARIA attributes
- Ensure screen reader compatibility
- Maintain appropriate focus management

### Error Handling

- Present user-friendly error messages
- Log detailed errors for debugging
- Implement graceful degradation

## Mobile-First Approach

### Viewport Configuration

- Set appropriate viewport meta tags
- Design for mobile screens first, then enhance for larger screens
- Test on actual mobile devices, not just emulators

### Touch Optimization

- Use appropriate touch targets (minimum 44x44px)
- Implement touch-friendly interactions
- Add `touch-manipulation` CSS property to interactive elements

### Responsive Layout

- Use Flexbox and CSS Grid for responsive layouts
- Implement different navigation patterns for mobile and desktop
- Test all features on various screen sizes

### Performance Considerations

- Optimize images and assets for mobile devices
- Minimize network requests for mobile users
- Implement offline capabilities where appropriate

## Design Language

### Visual Hierarchy

- Establish clear visual hierarchy
- Use consistent spacing and typography
- Follow the 8px grid system

### Typography

- Use a clear typographic scale
- Limit font variations
- Ensure readability on all devices

### Animation and Transitions

- Use subtle animations to enhance UX
- Keep animations under 300ms for UI responsiveness
- Respect user preferences for reduced motion

### Iconography

- Use a consistent icon set
- Ensure icons are recognizable and meaningful
- Provide text alternatives for accessibility

## Codebase Structure

### Project Organization

- Organize code by feature, not type
- Use consistent naming conventions
- Keep related files together

### Module Structure

- Create feature modules for each major feature
- Use shared modules for common functionality
- Lazy load feature modules

### Folder Structure

```
/app
  /core             # Core functionality (guards, services)
  /features         # Feature modules
  /shared           # Shared components, pipes, directives
  /store            # NgRx store
  /layouts          # Application layouts
  /utils            # Utility functions
```

### File Naming

- Use kebab-case for filenames
- Include the file type in the name
- Examples:
  - user-profile.component.ts
  - auth.service.ts
  - dashboard.actions.ts

## Code Quality & Testing

### Code Quality Tools

- Use ESLint for code quality enforcement
- Implement Prettier for consistent formatting
- Run linting as part of CI/CD pipeline

### Unit Testing

- Aim for minimum 80% code coverage
- Test components, services, pipes, and directives
- Mock external dependencies

### Integration Testing

- Test component interactions
- Test routing and navigation
- Test forms and user input

### End-to-End Testing

- Use Cypress for E2E testing
- Test critical user flows
- Include visual regression testing

## Documentation Standards

### Code Documentation

- Document public APIs with JSDoc comments
- Explain complex logic with inline comments
- Use meaningful variable and function names

### Component Documentation

- Document inputs, outputs, and usage examples
- Include accessibility considerations
- Document any non-obvious behaviors

### Project Documentation

- Maintain up-to-date README files
- Document environment setup
- Include deployment instructions

## Development Workflow

### Version Control

- Use feature branches for development
- Follow conventional commits for commit messages
- Require PR reviews before merging

### Continuous Integration

- Run tests and linting on each commit
- Enforce code coverage thresholds
- Generate build artifacts for review

### Release Process

- Use semantic versioning
- Maintain a changelog
- Tag releases in git