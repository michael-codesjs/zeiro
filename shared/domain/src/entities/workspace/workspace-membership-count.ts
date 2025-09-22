import { Entity } from 'electrodb'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

const client = new DynamoDBClient({ region: process.env.AWS_REGION })

export const WorkspaceMembershipCount = new Entity({
  model: {
    entity: 'WorkspaceMembershipCount',
    version: '1',
    service: 'zeiro',
  },
  attributes: {
    workspace_id: {
      type: 'string',
      required: true,
    },
    count: {
      type: 'number',
      required: true,
      default: 0,
    },
    active_count: {
      type: 'number',
      default: 0,
    },
    pending_count: {
      type: 'number',
      default: 0,
    },
    suspended_count: {
      type: 'number',
      default: 0,
    },
    last_updated: {
      type: 'string',
      watch: '*',
      set: () => new Date().toISOString(),
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
    primary: {
      pk: {
        field: 'PK',
        composite: ['workspace_id'],
        template: 'WORKSPACE#${workspace_id}',
        casing: 'none',  // Preserve the case in template
      },
      sk: {
        field: 'SK',
        composite: [],
        template: 'MEMBER_COUNT',
        casing: 'none',  // Preserve the case in template
      },
    },
  },
}, {
  table: process.env.ZEIRO_TABLE_NAME,
  client,
})
