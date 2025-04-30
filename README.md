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
3. **Deploy**: Deploys the application to AWS ECS

### Required Secrets for CI/CD

Set these secrets in your GitHub repository:

- `AWSACCESSKEYID`: Your AWS access key ID
- `AWSSECRETACCESSKEY`: Your AWS secret access key
- `AWSREGION`: The AWS region you're using (e.g., us-east-1)
- `ECRREPOSITORY`: The name of your ECR repository (lynqe-app)
- `ECSCLUSTER`: The name of your ECS cluster (e.g., lynqe-cluster)
- `ECSSERVICE`: The name of your ECS service (e.g., lynqe-service)

## AWS ECS Deployment

This application is deployed to AWS Elastic Container Service (ECS) using the CI/CD pipeline. The deployment process:

1. Builds the application and packages it into a Docker container
2. Pushes the container to Amazon ECR
3. Updates the ECS service to use the latest container image
4. Ensures proper subnet configuration for compatibility with the load balancer

### ECS Configuration Best Practices

- **Subnet Configuration**: The application must run in subnets compatible with the load balancer's availability zones. This is automatically handled by the CI/CD pipeline.
- **CloudWatch Logging**: The ECS tasks are configured to send logs to CloudWatch under the `/ecs/lynqe-app` log group.
- **Health Checks**: The application container exposes port 80 which is monitored by the load balancer for health checks.

### CloudWatch Logging

Before deploying to ECS, ensure the required CloudWatch log groups exist by running the included setup script:

```bash
./cloudwatch-setup.sh [aws-region]
```

This script:
- Creates the required `/ecs/lynqe-app` log group if it doesn't exist
- Creates a cluster-level log group for ECS platform logging
- Sets appropriate retention policies (default: 14 days)
- Checks for existing log streams

#### Monitoring Application Logs

To view your application logs:

1. **Using AWS CLI**:
   ```bash
   aws logs get-log-events --log-group-name "/ecs/lynqe-app" --log-stream-name "ecs/lynqe-app-container/TASK_ID" --region us-east-1
   ```
   Replace `TASK_ID` with your ECS task ID and `us-east-1` with your region.

2. **Using AWS Console**:
   - Navigate to CloudWatch > Log groups
   - Select the `/ecs/lynqe-app` log group
   - Browse the available log streams

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
