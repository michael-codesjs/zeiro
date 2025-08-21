# Zeiro Deployment Workflows

This directory contains GitHub Actions workflows for automated deployment of the Zeiro platform.

## Workflow Overview

### `deploy.yml` - Main Deployment Workflow

This workflow handles the automated deployment of all Zeiro services, infrastructure, and clients with intelligent change detection.

#### Key Features

1. **Smart Change Detection**: Only deploys services that have actual changes
2. **Shared SDK Dependency Management**: When the shared SDK changes, all dependent services are automatically deployed
3. **Turbo Integration**: Uses Turborepo for efficient builds and caching
4. **Multi-Environment Support**: Supports both development and production deployments
5. **Parallel Deployments**: Services deploy in parallel for faster deployment times
6. **Infrastructure-First**: Ensures infrastructure is deployed before services

#### Workflow Triggers

- **Push to `main`**: Triggers production deployment
- **Push to `develop`**: Triggers development deployment  
- **Pull Requests to `main`**: Runs tests and validation only

#### Jobs Breakdown

##### 1. `detect-changes`
- Uses `dorny/paths-filter` to detect which parts of the codebase have changed
- Determines which services need deployment based on file changes
- If `shared/sdk/**` changes, marks ALL services for deployment
- Outputs service lists for downstream jobs

##### 2. `build-and-test`
- Runs for any service or SDK changes
- Installs dependencies using Yarn
- Builds the shared SDK if it changed
- Builds the CLI tools
- Runs type checking, linting, and tests
- Uses Turbo for efficient parallel execution

##### 3. `deploy-infrastructure`
- Only runs on `main` branch when infrastructure files change
- Deploys platform and network infrastructure using Terraform
- Runs before service deployments to ensure dependencies are available

##### 4. `deploy-services`
- Deploys services in parallel using a matrix strategy
- Only runs for services that have changes (or all if SDK changed)
- Uses the Zeiro CLI for consistent deployment patterns
- Generates environment variables from SSM parameters
- Deploys both infrastructure and application components

##### 5. `deploy-clients`
- Deploys frontend applications (dashboard and marketing)
- Only runs when client files change
- Builds using Turbo and deploys to AWS Amplify

##### 6. `deploy-dev`
- Similar to production deployment but targets development environment
- Runs on `develop` branch pushes
- Uses separate AWS credentials for development environment

##### 7. `notify`
- Provides deployment status notifications
- Runs after all deployment jobs complete

## Service Dependencies

All services depend on the shared SDK (`@zeiro/sdk`):

- `@zeiro/authentication`
- `@zeiro/chat` 
- `@zeiro/credentials`
- `@zeiro/data-sources`
- `@zeiro/executions`
- `@zeiro/users`
- `@zeiro/websocket`

When the SDK changes, all services are automatically redeployed to ensure consistency.

## Required GitHub Secrets

### Production Environment
- `AWS_ACCESS_KEY_ID`: AWS access key for production deployments
- `AWS_SECRET_ACCESS_KEY`: AWS secret key for production deployments
- `AWS_REGION`: AWS region for deployments (e.g., `us-east-1`)

### Development Environment  
- `AWS_ACCESS_KEY_ID_DEV`: AWS access key for development deployments
- `AWS_SECRET_ACCESS_KEY_DEV`: AWS secret key for development deployments

## Environment Configuration

The workflow supports two environments:

1. **Production** (`main` branch)
   - Uses production AWS credentials
   - Deploys with `--stage prod` flag
   - Requires manual approval via GitHub environments

2. **Development** (`develop` branch)
   - Uses development AWS credentials  
   - Deploys with `--stage dev` flag
   - Automatic deployment without approval

## Deployment Process

### For Service Changes

1. Developer pushes changes to a service directory
2. Workflow detects changes in `services/[service-name]/**`
3. Builds and tests the affected service
4. Deploys only the changed service using Zeiro CLI
5. Service deployment includes both infrastructure and application

### For SDK Changes

1. Developer pushes changes to `shared/sdk/**`
2. Workflow detects SDK changes
3. Builds the updated SDK
4. Deploys ALL services that depend on the SDK
5. Ensures all services use the latest SDK version

### For Infrastructure Changes

1. Developer pushes changes to `infrastructure/**`
2. Workflow deploys platform and network infrastructure first
3. Then proceeds with any service deployments
4. Ensures proper dependency order

## Monitoring and Debugging

### Workflow Logs
- Each job provides detailed logs in the GitHub Actions interface
- Service deployments show Zeiro CLI output
- Terraform operations show plan and apply results

### Failed Deployments
- Individual service failures don't stop other services from deploying
- Failed jobs can be re-run individually
- Notification job reports overall deployment status

## Local Testing

To test deployment logic locally:

```bash
# Test service deployment
cd services/[service-name]
../../shared/cli/dist/index.js deploy --stage dev

# Test infrastructure deployment
cd infrastructure/platform
terraform init
terraform plan

# Test builds
yarn turbo run build --filter='@zeiro/sdk'
yarn turbo run test --filter='./services/*'
```

## Customization

### Adding New Services

1. Create service in `services/[new-service]/`
2. Add service to the change detection filters in `deploy.yml`
3. Add service to the services array in the "Determine services to deploy" step
4. Ensure service has proper `package.json` with `@zeiro/sdk` dependency

### Modifying Deployment Steps

1. Update the relevant job in `deploy.yml`
2. Test changes on a feature branch first
3. Ensure proper error handling and rollback procedures

### Environment Variables

Services that need environment variables should:
1. Have a `scripts/generate-env.ts` file
2. Use the Zeiro CLI's environment generation features
3. Store sensitive values in AWS SSM Parameter Store

## Best Practices

1. **Test Locally First**: Always test deployments locally before pushing
2. **Small Changes**: Make incremental changes to reduce deployment risk
3. **Monitor Deployments**: Watch the GitHub Actions logs during deployment
4. **Environment Parity**: Keep development and production environments in sync
5. **Rollback Plan**: Have a rollback strategy for failed deployments

## Troubleshooting

### Common Issues

1. **AWS Credentials**: Ensure secrets are properly configured in GitHub
2. **Terraform State**: State conflicts may require manual intervention
3. **Service Dependencies**: Ensure services are deployed in proper order
4. **Build Failures**: Check for TypeScript errors or missing dependencies

### Getting Help

1. Check the GitHub Actions logs for detailed error messages
2. Review the Zeiro CLI documentation for deployment issues
3. Verify AWS permissions and resource availability
4. Test individual components locally to isolate issues
