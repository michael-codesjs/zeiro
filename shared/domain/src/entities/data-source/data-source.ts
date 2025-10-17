import { Entity } from 'electrodb'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'

// Create DynamoDB Document Client
const ddbClient = new DynamoDBClient({ region: process.env.AWS_REGION })
const client = DynamoDBDocumentClient.from(ddbClient)

export const DataSource = new Entity({
  model: {
    entity: 'DataSource',
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
    description: {
      type: 'string',
    },
    type: {
      type: 'string',
      required: true,
      enum: ['DynamoDB', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Cassandra', 'InfluxDB', 'Elasticsearch'],
    },
    credential_id: {
      type: 'string',
      required: true,
    },
    connection_config: {
      type: 'any', // Flexible object for different connection configurations
      required: true,
    },
    // Standard entity fields
    entity_type: {
      type: 'string',
      default: 'DATA_SOURCE',
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
    // Primary index: by workspace
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
        template: 'DATA_SOURCE#${id}',
        casing: 'none',
      },
    },
    // GSI1: by workspace and type for filtering
    byWorkspaceAndType: {
      index: 'GSI1',
      pk: {
        field: 'GSI1_PK',
        composite: ['workspace_id', 'type'],
        template: 'WORKSPACE#${workspace_id}#TYPE#${type}',
        casing: 'none',
      },
      sk: {
        field: 'GSI1_SK',
        composite: ['created_at'],
        template: '${created_at}',
        casing: 'none',
      },
    },
    // GSI4: by data source ID for direct lookups (matches existing data)
    byId: {
      index: 'GSI4',
      pk: {
        field: 'GSI4_PK',
        composite: ['id'],
        template: 'DATA_SOURCE#${id}',
        casing: 'none',
      },
      sk: {
        field: 'GSI4_SK',
        composite: ['workspace_id'],
        template: 'WORKSPACE#${workspace_id}',
        casing: 'none',
      },
    },
  },
}, {
  table: process.env.ZEIRO_TABLE_NAME || 'zeiro-main-dev',
  client,
})
