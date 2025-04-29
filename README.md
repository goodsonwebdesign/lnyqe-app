# LNYQE Angular Application

A modern Angular application with NgRx state management and Tailwind CSS.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Docker Setup

This project is configured with Docker for both development and production environments.

### Development Environment

To start the development environment:

```bash
npm run docker:dev
```

This will start the application in development mode with hot reloading at http://localhost:4200.

To rebuild the development Docker image:

```bash
npm run docker:dev:build
```

### Production Environment

To build and start the production environment:

```bash
npm run docker:prod
```

This will build the application for production and serve it using Nginx at http://localhost:80.

To rebuild the production Docker image:

```bash
npm run docker:prod:build
```

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## CI/CD Pipeline

This project uses GitHub Actions for CI/CD with AWS. The pipeline includes:

1. **Build and Test**: Runs tests and builds the application
2. **Build Docker Images**: Builds and pushes the Docker image to Amazon ECR
3. **Deploy**: Deploys the application to AWS (ECS, EKS, or Elastic Beanstalk)

### Required Secrets for CI/CD

Set these secrets in your GitHub repository:

- `AWS_ACCESS_KEY_ID`: Your AWS access key ID
- `AWS_SECRET_ACCESS_KEY`: Your AWS secret access key
- `AWS_REGION`: The AWS region you're using (e.g., us-east-1)
- `ECR_REPOSITORY`: The name of your ECR repository

For specific AWS deployment:
- Additional secrets may be needed depending on your AWS deployment method

## Manual Commands

### Development

Start the application locally:

```bash
npm start
```

### Testing

Run tests:

```bash
npm test
```

### Building

Build for production:

```bash
npm run build
```

## Project Structure

- `src/` - Application source code
  - `app/` - Angular components
    - `store/` - NgRx store (actions, reducers, selectors, effects)
- `Dockerfile.dev` - Development Docker configuration
- `Dockerfile.prod` - Production Docker configuration
- `docker-compose.yml` - Docker Compose configuration
- `nginx.conf` - Nginx configuration for production
- `.github/workflows/ci-cd.yml` - GitHub Actions CI/CD workflow for AWS deployment

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
