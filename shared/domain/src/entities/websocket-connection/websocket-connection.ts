import { Entity } from 'electrodb'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'

const ddbClient = new DynamoDBClient({ region: process.env.AWS_REGION })
const client = DynamoDBDocumentClient.from(ddbClient, {
  marshallOptions: {
    removeUndefinedValues: true,
  },
})

export const WebSocketConnection = new Entity({
  model: {
    entity: 'WebSocketConnection',
    version: '1',
    service: 'zeiro',
  },
  attributes: {
    connection_id: {
      type: 'string',
      required: true,
    },
    user_id: {
      type: 'string',
      required: true,
    },
    workspace_id: {
      type: 'string',
      required: true,
    },
    status: {
      type: 'string',
      required: true,
      enum: ['connected', 'disconnected', 'stale'],
      default: 'connected',
    },
    last_seen_at: {
      type: 'string',
    },
    expires_at: {
      type: 'number',
      required: true,
    },
    metadata: {
      type: 'any',
    },
    // Standard entity fields
    entity_type: {
      type: 'string',
      default: 'WEBSOCKET_CONNECTION',
      readOnly: true,
    },
    creator_id: {
      type: 'string',
      watch: ['user_id'],
      set: (_, { user_id }) => user_id,
    },
    creator_type: {
      type: 'string',
      default: 'USER',
      readOnly: true,
    },
    discontinued: {
      type: 'boolean',
      default: false,
    },
    created_at: {
      type: 'string',
      readOnly: true,
      default: () => new Date().toISOString(),
    },
    updated_at: {
      type: 'string',
      watch: '*',
      set: () => new Date().toISOString(),
    },
  },
  indexes: {
    // Primary index: by user with connection as sort key
    primary: {
      collection: 'websocketData',
      pk: {
        field: 'PK',
        composite: ['user_id'],
        template: 'USER#${user_id}',
        casing: 'none',
      },
      sk: {
        field: 'SK',
        composite: ['connection_id'],
        template: 'CONNECTION#${connection_id}',
        casing: 'none',
      },
    },
    // GSI1: by connection for direct connection lookups
    byConnection: {
      index: 'GSI1',
      collection: 'connectionLookup',
      pk: {
        field: 'GSI1_PK',
        composite: ['connection_id'],
        template: 'CONNECTION#${connection_id}',
        casing: 'none',
      },
      sk: {
        field: 'GSI1_SK',
        composite: ['user_id'],
        template: 'USER#${user_id}',
        casing: 'none',
      },
    },
    // GSI2: by workspace for workspace-wide operations
    byWorkspace: {
      index: 'GSI2',
      collection: 'workspaceConnections',
      pk: {
        field: 'GSI2_PK',
        composite: ['workspace_id'],
        template: 'WORKSPACE#${workspace_id}',
        casing: 'none',
      },
      sk: {
        field: 'GSI2_SK',
        composite: ['status', 'created_at'],
        template: 'STATUS#${status}#${created_at}',
        casing: 'none',
      },
    },
  },
}, {
  table: process.env.ZEIRO_TABLE_NAME,
  client,
})
