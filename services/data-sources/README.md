# Zeiro Data Sources Service

The Data Sources Service manages database connections and data source configurations for the Zeiro platform.

## Features

- **Multiple Database Support**: DynamoDB, PostgreSQL, MySQL, MongoDB, Redis, Cassandra, InfluxDB, Elasticsearch
- **Secure Connection Management**: Integrates with credentials service for secure access
- **User Isolation**: Data sources are scoped to individual users
- **Environment Management**: Support for development, staging, and production environments
- **Auto-Discovery**: Automatic discovery of existing databases (starting with DynamoDB)
- **RESTful API**: Standard HTTP endpoints for CRUD operations

## Supported Data Source Types

### DynamoDB
- AWS Region configuration
- Account ID specification
- Table discovery and schema analysis

### PostgreSQL (Coming Soon)
- Host/Port configuration
- SSL support
- Connection pooling

### MySQL (Coming Soon)
- Host/Port configuration
- SSL support
- Connection pooling

### MongoDB (Coming Soon)
- Connection string support
- Authentication methods
- Replica set configuration

### Other Databases (Coming Soon)
- Redis
- Cassandra
- InfluxDB
- Elasticsearch

## API Endpoints

### Create Data Source
```
POST /data-sources
```

**Request Body:**
```json
{
  "name": "Production DynamoDB",
  "description": "Main production database",
  "type": "DynamoDB",
  "environment": "production",
  "credential_id": "cred-123",
  "connection_config": {
    "region": "us-east-1",
    "account_id": "123456789012"
  },
  "auto_connect": true
}
```

### Get Data Sources
```
GET /data-sources?type=DynamoDB&environment=production&page=1&limit=10
```

**Response:**
```json
{
  "databases": [
    {
      "id": "ds-123",
      "user_id": "user-123",
      "name": "Production DynamoDB",
      "description": "Main production database",
      "type": "DynamoDB",
      "status": "connected",
      "environment": "production",
      "credential_id": "cred-123",
      "connection_config": {
        "region": "us-east-1",
        "account_id": "123456789012"
      },
      "auto_connect": true,
      "created_at": "2024-01-15T10:00:00Z",
      "updated_at": "2024-01-15T10:00:00Z",
      "last_accessed": "2024-01-20T15:30:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10
}
```

### Delete Data Source
**Request Body:**
```json
{
  "credential_id": "cred-123",
  "region": "us-east-1"
}
```

**Response:**
```json
{
  "databases": [
    {
      "name": "users-table",
      "arn": "arn:aws:dynamodb:us-east-1:123456789012:table/users-table",
      "status": "ACTIVE",
      "item_count": 1250,
      "size_bytes": 1048576,
      "creation_date": "2024-01-01T00:00:00Z",
      "billing_mode": "PAY_PER_REQUEST",
      "region": "us-east-1"
    }
  ],
  "summary": {
    "total_tables": 5,
    "described_tables": 5,
    "has_more": false,
    "region": "us-east-1",
    "credential_id": "cred-123"
  }
}
```

## Domain Events

The service publishes the following domain events:

- `DATABASE_CREATED`: When a new data source is created
- `DATABASE_DELETED`: When a data source is deleted

## Infrastructure

The service uses the following AWS resources:

- **DynamoDB Table**: `zeiro-data-sources-table-{stage}` for storing data source configurations
- **IAM Roles**: Service-specific roles with minimal required permissions
- **SSM Parameters**: For environment-specific configuration

## Environment Variables

- `DATA_SOURCES_DYNAMODB_TABLE_NAME`: Name of the DynamoDB table
- `CENTRAL_EVENT_BUS_ARN`: ARN of the central EventBridge bus
- `CREDENTIALS_SERVICE_URL`: URL of the credentials service API

## Development

### Local Testing
```bash
# Install dependencies
yarn install

# Run tests
yarn test

# Deploy to development
yarn deploy:dev
```

### Testing with Serverless Offline
```bash
yarn offline
```

## Architecture

The service follows clean architecture principles:

- **Domain Layer**: Core business logic and entities
- **Application Layer**: Use cases and application services  
- **Infrastructure Layer**: External dependencies (DynamoDB, EventBridge)
- **Adapters**: Interface adapters for HTTP, events, and data persistence

## Security

- All data sources are scoped to individual users
- Credentials are stored separately in the credentials service
- IAM roles follow principle of least privilege
- All API endpoints require authentication 