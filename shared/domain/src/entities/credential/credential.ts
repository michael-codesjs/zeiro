import { Entity } from 'electrodb'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

const client = new DynamoDBClient({ region: process.env.AWS_REGION })

export const Credential = new Entity({
  model: {
    entity: 'Credential',
    version: '1',
    service: 'zeiro',
  },
  attributes: {
    id: {
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
    name: {
      type: 'string',
      required: true,
    },
    type: {
      type: ['iam_access_keys', 'service_account_keys', 'service_principals', 'connection_details'] as const,
      required: true,
    },
    status: {
      type: ['active', 'inactive', 'expired'] as const,
      required: true,
      default: 'active',
    },
    // AWS specific fields
    account_id: {
      type: 'string',
    },
    access_key_id: {
      type: 'string',
    },
    secret_access_key: {
      type: 'string', // This will be encrypted
    },
    region: {
      type: 'string',
    },
    // GCP specific fields
    service_account_key: {
      type: 'string', // This will be encrypted
    },
    project_id: {
      type: 'string',
    },
    // Azure specific fields
    client_id: {
      type: 'string',
    },
    client_secret: {
      type: 'string', // This will be encrypted
    },
    tenant_id: {
      type: 'string',
    },
    subscription_id: {
      type: 'string',
    },
    // Database specific fields
    host: {
      type: 'string',
    },
    port: {
      type: 'number',
    },
    database: {
      type: 'string',
    },
    username: {
      type: 'string',
    },
    password: {
      type: 'string', // This will be encrypted
    },
    ssl: {
      type: 'boolean',
    },
    // Generic connection details for flexible credential types
    connection_details: {
      type: 'any',
    },
    // Metadata
    last_used: {
      type: 'string',
    },
    entity_type: {
      type: 'string',
      default: 'CREDENTIAL',
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
    byWorkspace: {
      collection: 'workspaceData',
      pk: {
        field: 'PK',
        composite: ['workspace_id'],
        template: 'WORKSPACE#${workspace_id}',
        casing: 'none',
      },
      sk: {
        field: 'SK',
        composite: ['id'],
        template: 'CREDENTIAL#${id}',
        casing: 'none',
      },
    },
    byUser: {
      index: 'GSI1',
      pk: {
        field: 'GSI1_PK',
        composite: ['user_id'],
        template: 'USER#${user_id}',
        casing: 'none',
      },
      sk: {
        field: 'GSI1_SK',
        composite: ['created_at'],
        template: 'CREDENTIAL#${created_at}',
        casing: 'none',
      },
    },
    byType: {
      index: 'GSI2',
      pk: {
        field: 'GSI2_PK',
        composite: ['workspace_id', 'type'],
        template: 'WORKSPACE#${workspace_id}#TYPE#${type}',
        casing: 'none',
      },
      sk: {
        field: 'GSI2_SK',
        composite: ['status', 'created_at'],
        template: 'STATUS#${status}#${created_at}',
        casing: 'none',
      },
    },
    byId: {
      index: 'GSI3',
      pk: {
        field: 'GSI3_PK',
        composite: ['id'],
        template: 'CREDENTIAL#${id}',
        casing: 'none',
      },
      sk: {
        field: 'GSI3_SK',
        composite: ['workspace_id'],
        template: 'WORKSPACE#${workspace_id}',
        casing: 'none',
      },
    },
  },
}, {
  table: process.env.ZEIRO_TABLE_NAME,
  client,
})
