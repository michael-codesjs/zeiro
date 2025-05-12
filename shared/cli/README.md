# zeiro CLI

A command-line tool for managing zeiro microservices deployment and operations.

## Installation

Install the CLI tool globally:

```bash
npm install -g @zeiro/cli-tools
```

Or link it locally for development:

```bash
# From the cli directory
npm link
```

## Usage

### Initializing a New Service

To create a new service:

```bash
zeiro initialize
# or the shorter version
zeiro init
```

This interactive command will:

1. Ask what type of component you want to create (currently only services are supported)
2. Ask which layer the service belongs to (domain, infrastructure, platform)
3. If domain layer is selected, ask for the domain name
4. Ask for the service name
5. Generate a complete service structure with all necessary files

If run in an existing service directory without configuration, it will prompt you to configure that service.

### Generating Environment Variables

To generate environment variables from your service configuration:

```bash
zeiro env
```

This will create a `.env` file in the current directory based on the `environment` section in your `config.zero` file.

The `config.zero` file should contain an `environment` section with key-value pairs where:

- The key is the environment variable name
- The value is the SSM parameter path to fetch the value from

Example `config.zero`:

```json
{
  "type": "service",
  "layer": "domain",
  "domain": "user",
  "name": "users",
  "environment": {
    "DATABASE_URL": "/zeiro/${stage}/infrastructure/storage/postgres/url",
    "EVENT_BUS_NAME": "/zeiro/${stage}/infrastructure/io/event-bus/central/name",
    "EVENT_BUS_ARN": "/zeiro/${stage}/infrastructure/io/event-bus/central/arn"
  }
}
```

You can specify a stage for the environment variables:

```bash
zeiro env --stage prod
# or using the shorthand
zeiro env -s prod
```

The ${stage} placeholder in SSM paths will be replaced with the actual stage value.

### Deploying a Service

To deploy a service, navigate to the service directory and run:

```bash
zeiro deploy
```

By default, this deploys both infrastructure and application to the `dev` stage.

For services without an infrastructure folder (like the Cognito service), the CLI automatically detects this and only deploys the serverless application.

#### Deploy Options

**Deploy to a specific stage**:

```bash
zeiro deploy --stage prod
# or using the shorthand
zeiro deploy -s prod
```

**Force Terraform initialization**:

```bash
zeiro deploy --force-init
# or using the shorthand
zeiro deploy -f
```

**Deploy only the serverless application**:

```bash
zeiro deploy --app
# or using the shorthand
zeiro deploy -a
```

**Deploy only the infrastructure**:

```bash
zeiro deploy --infra
# or using the shorthand
zeiro deploy -i
```

You can combine these options as needed:

```bash
# Deploy only the application to production
zeiro deploy -a -s prod

# Deploy only the infrastructure with forced initialization
zeiro deploy -i -f
```

## Features

- Auto-detects service and domain name from current directory structure
- Initializes new services with proper folder structure and configuration
- Configures existing services that lack zeiro configuration
- Generates environment variables from SSM parameters based on service configuration
- Intelligently detects whether a service has infrastructure or is app-only
- Initializes Terraform with proper backend configuration when needed
- Deploys both infrastructure and application components separately or together
- Uses consistent state management across all services
- Provides clear, colorful terminal output with progress indicators

## Development

### Build the CLI

```bash
npm run build
```

### Watch for changes

```bash
npm run build:watch
```

### Run tests

```bash
npm test
```
