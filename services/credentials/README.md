# Zeiro Credentials Service

The Credentials Service manages secure storage and retrieval of database connection credentials and cloud provider access keys for the Zeiro platform.

## Features

- **Secure Storage**: All sensitive credential data is encrypted at rest
- **Multiple Provider Support**: AWS, GCP, Azure, and direct database credentials
- **User Isolation**: Credentials are scoped to individual users
- **Audit Trail**: Domain events for all credential operations
- **RESTful API**: Standard HTTP endpoints for CRUD operations

## Supported Credential Types

### AWS Credentials
- Access Key ID
- Secret Access Key
- Default Region

### Google Cloud Platform (Coming Soon)
- Service Account Key
- Project ID

### Microsoft Azure (Coming Soon)
- Client ID
- Client Secret
- Tenant ID
- Subscription ID

### Database Direct (Coming Soon)
- Host
- Port
- Database Name
- Username
- Password
- SSL Configuration

## API Endpoints

### Create Credential
```
POST /credentials
```

**Request Body:**
```json
{
  "user_id": "user-123",
  "name": "Production AWS",
  "type": "aws",
  "access_key_id": "AKIA...",
  "secret_access_key": "...",
  "region": "us-east-1"
}
```

### Get Credentials
```
GET /credentials?user_id=user-123&type=aws&page=1&limit=10
```

**Response:**
```json
{
  "credentials": [
    {
      "id": "cred-123",
      "user_id": "user-123",
      "name": "Production AWS",
      "type": "aws",
      "status": "active",
      "access_key_id": "AKIA...",
      "secret_access_key": "***MASKED***",
      "region": "us-east-1",
      "created_at": "2024-01-15T10:00:00Z",
      "updated_at": "2024-01-15T10:00:00Z",
      "last_used": "2024-01-20T15:30:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10
}
```

### Update Credential
```
PUT /credentials/{id}
```

**Request Body:**
```json
{
  "user_id": "user-123",
  "updates": {
    "name": "Updated Production AWS",
    "region": "us-west-2"
  }
}
```

### Delete Credential
```
DELETE /credentials/{id}?user_id=user-123
```

## Security

- **Encryption**: All sensitive fields are encrypted using AES-256-CBC
- **Access Control**: Users can only access their own credentials
- **Masking**: Sensitive data is masked in API responses
- **Audit**: All operations generate domain events for auditing

## Domain Events

The service publishes the following domain events:

- `CREDENTIAL_CREATED`: When a new credential is created
- `CREDENTIAL_UPDATED`: When a credential is modified
- `CREDENTIAL_DELETED`: When a credential is removed
- `CREDENTIAL_USED`: When a credential is accessed for use

## Infrastructure

### DynamoDB Table Schema

**Primary Key:**
- `pk`: `USER#{user_id}`
- `sk`: `CREDENTIAL#{credential_id}`

**Global Secondary Indexes:**
- `gs1`: `CREDENTIAL#{type}` / `{created_at}` - Query by credential type
- `gs2`: `USER#{user_id}#TYPE#{type}` / `{created_at}` - Query user credentials by type

### Environment Variables

- `CREDENTIALS_DYNAMODB_TABLE_NAME`: DynamoDB table name
- `CREDENTIAL_ENCRYPTION_KEY`: Encryption key for sensitive data
- `CENTRAL_EVENT_BUS_NAME`: EventBridge bus for domain events
- `AWS_REGION`: AWS region for services

## Development

### Prerequisites

- Node.js 18+
- AWS CLI configured
- Serverless Framework
- Terraform (for infrastructure)

### Setup

1. Install dependencies:
```bash
npm install
```

2. Deploy infrastructure:
```bash
cd infrastructure/storage
terraform init
terraform apply
```

3. Deploy application:
```bash
npm run deploy:dev
```

### Testing

```bash
npm test
npm run test:coverage
```

### Local Development

```bash
npm run offline
```

## Deployment

### Development
```bash
npm run deploy:dev
```

### Production
```bash
npm run deploy:prod
```

## Architecture

The service follows Clean Architecture principles with:

- **Domain Layer**: Types and business logic
- **Application Layer**: Use cases and interfaces
- **Infrastructure Layer**: External adapters (DynamoDB, EventBridge)
- **Presentation Layer**: HTTP handlers and API definitions

## Security Considerations

1. **Encryption Keys**: Use AWS KMS in production instead of simple encryption
2. **IAM Roles**: Implement least-privilege access policies
3. **Network Security**: Deploy in private subnets with proper security groups
4. **Monitoring**: Set up CloudWatch alarms for suspicious activities
5. **Backup**: Enable point-in-time recovery for DynamoDB table

## Contributing

1. Follow the existing code patterns
2. Add tests for new functionality
3. Update documentation
4. Ensure security best practices 