import { Entity } from 'electrodb'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

const client = new DynamoDBClient({ region: process.env.AWS_REGION })

export const Workspace = new Entity({
  model: {
    entity: 'Workspace',
    version: '1',
    service: 'zeiro',
  },
  attributes: {
    id: {
      type: 'string',
      required: true,
    },
    workspace_id: {
      type: 'string',
      watch: ['id'],
      set: (_, { id }) => id,
    },
    creator_id: {
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
    metadata: {
      type: 'any',
    },
  },
  indexes: {
    primary: {
      collection: 'workspaceData',
      pk: {
        field: 'PK',
        composite: ['workspace_id'],
        template: 'WORKSPACE#${workspace_id}',
        casing: 'none',
      },
      sk: {
        field: 'SK',
        composite: ['workspace_id'],
        template: 'WORKSPACE#${workspace_id}',
        casing: 'none',
      },
    },
    byCreator: {
      index: 'GSI1',
      pk: {
        field: 'GSI1_PK',
        composite: ['creator_id'],
        template: 'USER#${creator_id}',
        casing: 'none',  // Preserve the case in template
      },
      sk: {
        field: 'GSI1_SK',
        composite: ['created_at'],
        template: 'WORKSPACE#${created_at}',
        casing: 'none',  // Preserve the case in template
      },
    },
  },
}, {
  table: process.env.ZEIRO_TABLE_NAME,
  client,
})
