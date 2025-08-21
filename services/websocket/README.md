# Zeiro WebSocket Service

WebSocket service for managing real-time connections, broadcasting messages, and handling connection lifecycle events.

## Overview

The WebSocket Service provides real-time communication capabilities for the Zeiro platform. It handles WebSocket connections, manages connection state, and provides broadcasting functionality for other services.

## Core Components

1. **Connection Management** - Handle connect/disconnect events and maintain connection state
2. **Message Broadcasting** - Send messages to specific connections, users, or groups  
3. **Connection Storage** - Persistent storage of active connections in DynamoDB
4. **Route Handling** - Process different WebSocket routes and message types

## Key Features

- **Connection Lifecycle**: Handle $connect, $disconnect, and custom routes
- **User Authentication**: Validate JWT tokens for connection authorization
- **Message Broadcasting**: Send messages to specific users, databases, or broadcast to all
- **Connection Persistence**: Store connection metadata in DynamoDB
- **Health Monitoring**: Track connection health and cleanup stale connections

## API Routes

### WebSocket Routes
- `$connect` - Handle new WebSocket connections
- `$disconnect` - Handle WebSocket disconnections  
- `$default` - Handle custom message routing
- `send-message` - Send messages to specific targets
- `broadcast` - Broadcast messages to groups

## Architecture

The WebSocket Service follows a clean architecture pattern:

```
src/
├── adapters/
│   ├── primary/          # WebSocket route handlers
│   └── secondary/        # DynamoDB and external integrations
├── types/               # TypeScript type definitions
└── utilities/           # Helper functions and utilities
```

## Environment Variables

- `WEBSOCKET_CONNECTIONS_TABLE_NAME` - DynamoDB table for storing connections
- `CENTRAL_EVENT_BUS_ARN` - Event bus for publishing domain events
- `STAGE` - Deployment stage (dev, staging, prod)
- `REGION` - AWS region
