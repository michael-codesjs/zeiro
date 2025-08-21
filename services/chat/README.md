# Zeiro Chat Service

AI-powered conversational interface for database interactions with intelligent conversation management and memory persistence.

## Overview

The Chat Service handles conversational AI interactions for Zeiro's database querying platform. It provides natural language processing for database queries, thread management for conversation history, and WebSocket connections for real-time communication.

## Core Components

1. **Thread Management** - Persistent conversation threads with database ID as resourceId
2. **Query Generation** - Converts natural language to database query parameters
3. **WebSocket Support** - Real-time communication for chat interfaces
4. **Memory Management** - Conversation history and context preservation

## Key Features

- **Multi-Model Support**: GPT-4o, GPT-4o Mini, Claude 3.5 Sonnet, Claude 3.5 Haiku
- **Intelligent Routing**: Determines when to generate queries vs handle conversations directly
- **Conversation Memory**: Persistent chat history with thread management
- **Schema Analysis**: Database structure understanding for better query generation
- **Type Safety**: Full TypeScript support with proper interfaces

## API Endpoints

### Chat Generation
- `POST /chat/generate` - Generate query parameters from natural language
- `OPTIONS /chat/generate` - CORS preflight

### Thread Management
- Thread management endpoints for conversation history

### WebSocket
- WebSocket connections for real-time chat communication

## Architecture

The Chat Service follows a clean architecture pattern:

```
src/
├── adapters/
│   ├── primary/          # API endpoints and WebSocket handlers
│   └── secondary/        # External service integrations
├── mastra/              # AI agents for conversational processing
└── types/               # TypeScript type definitions
```

## Environment Variables

- `OPENAI_API_KEY` - OpenAI API key for GPT models
- `ANTHROPIC_API_KEY` - Anthropic API key for Claude models  
- `CREDENTIALS_SERVICE_URL` - URL for credentials service
- `EXECUTIONS_SERVICE_URL` - URL for executions service
- `MASTRA_STORAGE_TABLE_NAME` - DynamoDB table for thread storage

## Integration

The Chat Service integrates with:

- **Executions Service** - For actual query execution
- **Credentials Service** - For database credentials
- **Data Sources Service** - For database metadata
- **Authentication Service** - For user context

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Deploy
npm run deploy
```

## Related Services

- **Executions Service** - Handles actual database query execution
- **Credentials Service** - Manages database credentials
- **Data Sources Service** - Manages database connections 