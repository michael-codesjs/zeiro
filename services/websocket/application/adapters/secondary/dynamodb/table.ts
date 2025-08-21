import { Table } from 'dynamodb-onetable'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { configureEnviromentVariables } from '@zeiro/sdk'

const { WEBSOCKET_CONNECTIONS_TABLE_NAME, REGION } = configureEnviromentVariables()

const client = new DynamoDBClient({
  region: REGION || 'eu-central-1',
})

export const websocketConnectionsTable = new Table({
  name: WEBSOCKET_CONNECTIONS_TABLE_NAME || 'zeiro-dev-websocket-connections',
  client,
  delimiter: '#',
  typeField: '_type',
  timestamps: true,
  schema: {
    format: 'onetable:1.1.0',
    version: '0.0.1',
    indexes: {
      primary: { hash: 'pk', sort: 'sk' },
      gsi1: { hash: 'gsi1pk', sort: 'gsi1sk', project: 'all' },
    },
    models: {
      WebSocketConnection: {
        pk: { type: String, value: 'CONNECTION#${connectionId}' },
        sk: { type: String, value: 'USER#${userId}' },
        gsi1pk: { type: String, value: 'USER#${userId}' },
        gsi1sk: { type: String, value: 'CONNECTION#${connectionId}#${createdAt}' },
        connectionId: { type: String, required: true },
        userId: { type: String, required: true },
        databaseId: { type: String },
        status: { type: String, required: true, default: 'connected' },
        createdAt: { type: String, required: true },
        lastSeenAt: { type: String },
        expiresAt: { type: Number, required: true },
        metadata: { type: Object },
      },
    },
  },
  logger: process.env.NODE_ENV === 'development',
})
