import { Entity } from 'electrodb'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

const client = new DynamoDBClient({ region: process.env.AWS_REGION })

export const WorkspaceMembership = new Entity({
  model: {
    entity: 'WorkspaceMembership',
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
      required: true,
    },
    user_id: {
      type: 'string',
      required: true,
    },
    role: {
      type: ['owner', 'admin', 'member', 'guest'] as const,
      required: true,
    },
    status: {
      type: ['active', 'pending', 'suspended'] as const,
      required: true,
      default: 'pending',
    },
    invited_by: {
      type: 'string',
    },
    invited_at: {
      type: 'string',
    },
    joined_at: {
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
    byWorkspace: {
      collection: 'workspaceData',
      pk: {
        field: 'PK',
        composite: ['workspace_id'],
        template: 'WORKSPACE#${workspace_id}',
        casing: 'none',  // Preserve the case in template
      },
      sk: {
        field: 'SK',
        composite: ['user_id'],
        template: 'MEMBER#${user_id}',
        casing: 'none',  // Preserve the case in template
      },
    },
    byUser: {
      index: 'GSI1',
      pk: {
        field: 'GSI1_PK',
        composite: ['user_id'],
        template: 'USER#${user_id}',
        casing: 'none',  // Preserve the case in template
      },
      sk: {
        field: 'GSI1_SK',
        composite: ['workspace_id'],
        template: 'WORKSPACE#${workspace_id}',
        casing: 'none',  // Preserve the case in template
      },
    },
    byStatus: {
      index: 'GSI2',
      pk: {
        field: 'GSI2_PK',
        composite: ['workspace_id', 'status'],
        template: 'WORKSPACE#${workspace_id}#STATUS#${status}',
        casing: 'none',  // Preserve the case in template
      },
      sk: {
        field: 'GSI2_SK',
        composite: ['created_at'],
        template: '${created_at}',
        casing: 'none',  // Preserve the case in template
      },
    },
  },
}, {
  table: process.env.ZEIRO_TABLE_NAME,
  client,
})
