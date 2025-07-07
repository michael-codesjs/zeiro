# Zeiro Project - Comprehensive API Documentation

## Table of Contents

1. [Project Overview](#project-overview)
2. [Shared Libraries](#shared-libraries)
   - [SDK (@zeiro/sdk)](#sdk-zeiro-sdk)
   - [CLI (@zeiro/cli)](#cli-zeiro-cli)
3. [Services](#services)
   - [User Service](#user-service)
   - [Authentication Service](#authentication-service)
4. [Client Applications](#client-applications)
   - [Marketing Website](#marketing-website)
   - [Dashboard Application](#dashboard-application)
5. [Infrastructure](#infrastructure)
6. [Getting Started](#getting-started)

---

## Project Overview

Zeiro is a monorepo project built with Turborepo, containing a microservices architecture with shared libraries, backend services, and client applications. The project uses AWS Lambda for serverless functions, DynamoDB for data storage, and Next.js for client applications.

### Key Technologies
- **Backend**: Node.js, TypeScript, AWS Lambda, DynamoDB
- **Frontend**: React 19, Next.js 15, TailwindCSS
- **Infrastructure**: AWS (Lambda, DynamoDB, API Gateway, Cognito)
- **Build System**: Turborepo, Serverless Framework
- **Package Manager**: Yarn (v1.22.22)

---

## Shared Libraries

### SDK (@zeiro/sdk)

The Zeiro SDK provides core functionality and abstractions used across all services and applications.

#### Installation
```bash
yarn add @zeiro/sdk
```

#### Core Abstracts

##### Entity
Base class for domain entities.

```typescript
import { Entity } from '@zeiro/sdk'

class User extends Entity<UserAttributes> {
  constructor(attributes: UserAttributes) {
    super(attributes)
  }
}
```

##### Aggregate Root
Base class for aggregate roots in domain-driven design.

```typescript
import { AggregateRoot } from '@zeiro/sdk'

class UserAggregate extends AggregateRoot<UserAttributes> {
  // Implementation
}
```

##### Value Object
Base class for value objects.

```typescript
import { ValueObject } from '@zeiro/sdk'

class Email extends ValueObject<{ value: string }> {
  constructor(email: string) {
    super({ value: email })
  }
}
```

#### Middleware

##### Common Lambda Input
Middleware for handling common Lambda input patterns.

```typescript
import { CommonInputHandler } from '@zeiro/sdk'

const handler: CommonInputHandler<InputType, ResponseType> = async (input) => {
  // Handler implementation
  return response
}
```

##### API Gateway Input Transformer
Transforms API Gateway events for easier handling.

```typescript
import { ApiGwInputTransformerFunction } from '@zeiro/sdk'

const transformer: ApiGwInputTransformerFunction<OriginalInput, NewInput> = (originalInput) => {
  // Transform input
  return newInput
}
```

#### Higher-Order Functions

##### withCommonInput
HOF for handling common input patterns.

```typescript
import { withCommonInput } from '@zeiro/sdk'

export const handler = withCommonInput(async (input) => {
  // Handler logic
})
```

##### withLambdaStandard
HOF for standard Lambda function patterns.

```typescript
import { withLambdaStandard } from '@zeiro/sdk'

export const handler = withLambdaStandard(async (event, context) => {
  // Lambda logic
})
```

#### Utilities

##### Environment Configuration
```typescript
import { configureEnviromentVariables } from '@zeiro/sdk'

// Configure environment variables for the service
configureEnviromentVariables()
```

##### API Gateway Signed Fetcher
Utility for making signed requests to API Gateway.

```typescript
import { ApiGwSignedFetcher } from '@zeiro/sdk'

const fetcher = new ApiGwSignedFetcher({
  region: 'eu-central-1',
  apiGatewayUrl: 'https://api.example.com'
})

const response = await fetcher.fetch('/users', {
  method: 'GET'
})
```

#### Types

##### Domain Events
```typescript
export type DomainEvent<TName extends string, TData = any> = {
  name: TName
  data: TData
  aggregateId: string
  version: number
  timestamp: Date
}
```

##### Domain Commands
```typescript
export type DomainCommand<TName extends string, TData = any> = {
  name: TName
  data: TData
  aggregateId: string
}
```

##### Utility Types
```typescript
// Replace type utility
export type Replace<T, From, To> = T extends (...args: any[]) => any
  ? (...args: Replace<Parameters<T>, From, To>) => Replace<ReturnType<T>, From, To>
  : T extends Record<string, any>
  ? { [K in keyof T]: Replace<T[K], From, To> }
  : T extends From
  ? To
  : T

// Partial type utility
export type WithPartial<T, K extends keyof T> = { [P in K]?: T[P] } & Omit<T, K>
```

---

### CLI (@zeiro/cli)

The Zeiro CLI provides tools for managing and deploying Zeiro services.

#### Installation
```bash
# Install globally
npm install -g @zeiro/cli

# Or use from project root
yarn install-cli
```

#### Commands

##### Deploy Command
Deploy Zeiro services to AWS.

```bash
# Deploy entire service (infrastructure + application)
zeiro deploy

# Deploy specific stage
zeiro deploy --stage prod

# Deploy only application
zeiro deploy --app

# Deploy only infrastructure
zeiro deploy --infra

# Force Terraform initialization
zeiro deploy --force-init
```

**Options:**
- `-s, --stage <stage>`: Deployment stage (dev or prod), default: dev
- `-f, --force-init`: Force terraform initialization
- `-a, --app`: Deploy only the serverless application
- `-i, --infra`: Deploy only the infrastructure

##### Initialize Command
Initialize a new Zeiro component.

```bash
# Initialize a new service
zeiro initialize

# Short alias
zeiro init
```

This command provides an interactive setup for creating new services with:
- Service configuration
- Directory structure
- Serverless configuration
- Infrastructure templates
- Domain models and use cases

---

## Services

### User Service

The User Service manages user entities and operations.

#### API Endpoints

##### Create User
```http
POST /users
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phoneNumber": "+1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user_01234567890abcdef",
    "name": "John Doe",
    "email": "john@example.com",
    "phoneNumber": "+1234567890",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

##### Update User
```http
PUT /users/{id}
Content-Type: application/json

{
  "name": "Jane Doe",
  "email": "jane@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user_01234567890abcdef",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "phoneNumber": "+1234567890",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T10:30:00.000Z"
  }
}
```

#### Domain Events

##### USER_CREATED_DOMAIN_EVENT
Emitted when a new user is created.

```typescript
type USER_CREATED_DOMAIN_EVENT = DomainEvent<'USER_CREATED', {
  id: string
  name: string
  email: string
  phoneNumber?: string
}>
```

#### Configuration

The service uses the following environment variables:
- `CENTRAL_EVENT_BUS_ARN`: ARN of the central EventBridge bus
- `CENTRAL_EVENT_BUS_NAME`: Name of the central EventBridge bus

---

### Authentication Service

The Authentication Service handles user authentication using AWS Cognito with custom authentication flows.

#### Lambda Triggers

##### Pre Sign Up
Validates user registration data.

```typescript
type PreSignUpParams = { 
  phoneNumber?: string
  email?: string 
}

type PreSignUpReturnType = {
  autoConfirmUser: boolean
  autoVerifyEmail: boolean
  autoVerifyPhone: boolean
}
```

##### Create Auth Challenge
Creates custom authentication challenges.

```typescript
type CreateAuthChallengeUseCaseParams<T> = T extends 'ALL'
  ? { email: string; phoneNumber: string }
  : T extends 'EMAIL'
  ? { email: string; phoneNumber?: string }
  : T extends 'PHONE_NUMBER'
  ? { email?: string; phoneNumber: string }
  : never
```

##### Verify Auth Challenge
Verifies authentication challenge responses.

```typescript
type VerifyAuthChallengeUseCaseParams = {
  expectedAnswer: string
  challengeAnswer: string
}
```

##### Post Authentication
Handles post-authentication logic.

```typescript
type PostAuthenticationUseCaseParams = {
  userAttributes: Record<string, string>
  userSub: string
}
```

##### Post Confirmation
Handles post-confirmation logic after user verification.

##### Define Auth Challenge
Defines the authentication challenge flow.

##### Assign Username
Assigns usernames during registration.

##### Update Cognito User
Updates user attributes in Cognito.

#### Domain Events

##### USER_AUTHENTICATED_DOMAIN_EVENT
```typescript
type USER_AUTHENTICATED_DOMAIN_EVENT = DomainEvent<'USER_AUTHENTICATED', {
  userSub: string
  userAttributes: Record<string, string>
}>
```

##### SIGNATURE_GENERATED_DOMAIN_EVENT
```typescript
type SIGNATURE_GENERATED_DOMAIN_EVENT = DomainEvent<'SIGNATURE_GENERATED', {
  signature: string
  userSub: string
  challenge: string
}>
```

##### USER_UPDATED_DOMAIN_EVENT
```typescript
type USER_UPDATED_DOMAIN_EVENT = DomainEvent<'USER_UPDATED', {
  userSub: string
  updatedAttributes: Record<string, string>
}>
```

---

## Client Applications

### Marketing Website

A Next.js application for marketing and user onboarding.

#### Components

##### Button Component
Versatile button component with multiple variants.

```tsx
import { Button } from '@/components/Button'

// Basic usage
<Button>Click me</Button>

// With variants
<Button variant="secondary" size="lg">
  Large Secondary Button
</Button>

// With icons and loading state
<Button
  variant="primary"
  leftIcon={<Icon />}
  isLoading={loading}
  loadingText="Signing up..."
  onClick={handleSignUp}
>
  Sign Up
</Button>
```

**Props:**
```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  isLoading?: boolean
  loadingText?: string
  children: ReactNode
}
```

##### Form Components

**FormContainer**
```tsx
import { FormContainer } from '@/components/FormContainer'

<FormContainer
  title="Sign Up"
  description="Create your account"
  onSubmit={handleSubmit}
>
  {/* Form content */}
</FormContainer>
```

**FormInput**
```tsx
import { FormInput } from '@/components/FormInput'

<FormInput
  label="Email"
  type="email"
  placeholder="Enter your email"
  error={errors.email}
  {...register('email')}
/>
```

**PinInput**
```tsx
import { PinInput } from '@/components/PinInput'

<PinInput
  length={6}
  onComplete={handlePinComplete}
  error={pinError}
/>
```

##### Card Component
```tsx
import { Card } from '@/components/Card'

<Card className="p-6">
  <Card.Header>
    <Card.Title>Card Title</Card.Title>
  </Card.Header>
  <Card.Content>
    Card content goes here
  </Card.Content>
</Card>
```

##### Container Component
```tsx
import { Container } from '@/components/Container'

<Container size="lg" className="py-8">
  Content with consistent max-width
</Container>
```

#### Hooks

##### useAuth Hook
Custom hook for authentication state management.

```tsx
import { useAuth } from '@/hooks/useAuth'

function MyComponent() {
  const { user, signIn, signOut, signUp } = useAuth()

  return (
    <div>
      {user ? (
        <button onClick={signOut}>Sign Out</button>
      ) : (
        <button onClick={() => signIn({ email, password })}>
          Sign In
        </button>
      )}
    </div>
  )
}
```

#### Authentication Schemas

```typescript
import { signUpSchema, signUpStep1Schema, signUpStep2Schema } from '@/schemas/auth'

// Full sign up schema
type SignUpFormData = z.infer<typeof signUpSchema>

// Step 1 schema (email/phone)
type SignUpStep1FormData = z.infer<typeof signUpStep1Schema>

// Step 2 schema (verification)
type SignUpStep2FormData = z.infer<typeof signUpStep2Schema>
```

#### Utilities

##### Amplify Server Utils
```typescript
import { createServerContext, authenticatedUser } from '@/utils/amplify-server-utils'

// Create server context for SSR
const context = await createServerContext()

// Get authenticated user
const user = await authenticatedUser(context)
```

#### Routes
- `/` - Home page
- `/auth/*` - Authentication pages
- `/not-found` - 404 page

#### Development
```bash
# Start development server on port 3002
yarn dev

# Build for production
yarn build

# Start production server
yarn start
```

---

### Dashboard Application

A Next.js dashboard application for authenticated users.

#### Components

##### UI Components (Shadcn-style)

**Button Component**
```tsx
import { Button } from '@/components/ui/button'

// Basic usage
<Button>Click me</Button>

// Variants
<Button variant="secondary" size="lg">
  Secondary Large
</Button>

<Button variant="outline" size="sm">
  Small Outline
</Button>

<Button variant="danger" loading>
  Loading Danger Button
</Button>

// With icons
<Button
  leftIcon={<PlusIcon />}
  rightIcon={<ArrowIcon />}
>
  Add Item
</Button>
```

**Props:**
```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'gradient'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  fullWidth?: boolean
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  children: React.ReactNode
}
```

**Input Component**
```tsx
import { Input } from '@/components/ui/input'

<Input
  type="email"
  placeholder="Enter email"
  error={error}
  disabled={loading}
/>
```

#### Layout Components

Dashboard includes layout components for consistent UI structure.

#### Utilities

##### Class Name Utility
```typescript
import { cn } from '@/utils/cn'

// Merge class names with conflict resolution
const className = cn(
  'base-classes',
  condition && 'conditional-classes',
  props.className
)
```

##### Amplify Server Utils
Same utilities as marketing website for authentication.

#### Development
```bash
# Start development server on port 3003
yarn dev

# Build for production
yarn build

# Start production server
yarn start
```

---

## Infrastructure

The project uses Terraform for infrastructure management and the Serverless Framework for application deployment.

### Configuration Files

#### Terraform State
- State is stored in S3 buckets
- DynamoDB table for state locking: `zeiro-terraform-locks`
- Backend configuration is managed per service and stage

#### SSM Parameters
Services use AWS Systems Manager Parameter Store for configuration:
- `/zeiro/{stage}/infrastructure/io/central/api/id`
- `/zeiro/{stage}/infrastructure/io/central/api/root-resource-id`
- `/zeiro/{stage}/infrastructure/io/event-bus/central/arn`
- `/zeiro/{stage}/infrastructure/io/event-bus/central/name`

### Deployment Stages
- `dev` - Development environment
- `prod` - Production environment

---

## Getting Started

### Prerequisites
- Node.js >= 18
- Yarn 1.22.22
- AWS CLI configured
- Terraform (for infrastructure)

### Initial Setup

1. **Clone and install dependencies:**
```bash
git clone <repository-url>
cd zeiro
yarn install
```

2. **Install CLI globally:**
```bash
yarn install-cli
```

3. **Build all packages:**
```bash
yarn build
```

4. **Run development servers:**
```bash
# All services
yarn dev

# Specific services
cd clients/marketing && yarn dev
cd clients/dashboard && yarn dev
```

### Creating a New Service

1. **Initialize the service:**
```bash
mkdir my-new-service
cd my-new-service
zeiro init
```

2. **Follow the interactive prompts to configure:**
   - Service name
   - Layer (application/domain/infrastructure)
   - Domain (if applicable)
   - Entity models
   - Use cases

3. **Deploy the service:**
```bash
zeiro deploy --stage dev
```

### Development Workflow

1. **Make changes to source code**
2. **Run type checking:**
```bash
yarn check-types
```

3. **Run linting:**
```bash
yarn lint
```

4. **Format code:**
```bash
yarn format
```

5. **Deploy changes:**
```bash
zeiro deploy --stage dev
```

### Environment Variables

Each service can define environment variables in:
- `config.zero` - Service configuration
- `.env` files - Local development
- SSM Parameter Store - Deployed environments

### Testing

```bash
# Run all tests
yarn test

# Run tests for specific service
cd services/users && yarn test
cd services/authentication && yarn test
```

---

## API Error Handling

All APIs follow a consistent error response format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {} // Optional additional details
  }
}
```

Common error codes:
- `VALIDATION_ERROR` - Input validation failed
- `NOT_FOUND` - Resource not found
- `UNAUTHORIZED` - Authentication required
- `FORBIDDEN` - Insufficient permissions
- `INTERNAL_ERROR` - Internal server error

---

## Contributing

1. Follow the existing code style and patterns
2. Add appropriate tests for new functionality
3. Update documentation for public APIs
4. Use conventional commit messages
5. Ensure all CI checks pass

For more detailed contribution guidelines, see the project's contributing documentation.