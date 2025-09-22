import { Entity } from 'electrodb'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

const client = new DynamoDBClient({ region: process.env.AWS_REGION })

export const InvitationReminder = new Entity({
  model: {
    entity: 'InvitationReminder',
    version: '1',
    service: 'zeiro',
  },
  attributes: {
    id: {
      type: 'string',
      required: true,
    },
    invitation_token: {
      type: 'string',
      required: true,
    },
    workspace_id: {
      type: 'string',
      required: true,
    },
    membership_id: {
      type: 'string',
      required: true,
    },
    email: {
      type: 'string',
      required: true,
    },
    invited_by: {
      type: 'string',
      required: true,
    },
    reminder_type: {
      type: ['first_reminder', 'second_reminder', 'final_reminder'] as const,
      required: true,
    },
    reminder_count: {
      type: 'number',
      required: true,
      default: 0,
    },
    status: {
      type: ['pending', 'sent', 'cancelled'] as const,
      required: true,
      default: 'pending',
    },
    scheduled_for: {
      type: 'number', // Unix timestamp
      required: true,
    },
    ttl: {
      type: 'number', // Unix timestamp for DynamoDB TTL
      required: true,
    },
    sent_at: {
      type: 'string', // ISO string
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
    byId: {
      pk: {
        field: 'PK',
        composite: ['id'],
        template: 'INVITATION_REMINDER#${id}',
        casing: 'none',
      },
      sk: {
        field: 'SK',
        composite: ['id'],
        template: 'INVITATION_REMINDER#${id}',
        casing: 'none',
      },
    },
    byToken: {
      index: 'GSI1',
      pk: {
        field: 'GSI1_PK',
        composite: ['invitation_token'],
        template: 'TOKEN#${invitation_token}',
        casing: 'none',
      },
      sk: {
        field: 'GSI1_SK',
        composite: ['reminder_type'],
        template: 'REMINDER#${reminder_type}',
        casing: 'none',
      },
    },
    byWorkspace: {
      index: 'GSI2',
      pk: {
        field: 'GSI2_PK',
        composite: ['workspace_id'],
        template: 'WORKSPACE#${workspace_id}',
        casing: 'none',
      },
      sk: {
        field: 'GSI2_SK',
        composite: ['scheduled_for'],
        template: 'SCHEDULED#${scheduled_for}',
        casing: 'none',
      },
    },
    bySchedule: {
      index: 'GSI3',
      pk: {
        field: 'GSI3_PK',
        composite: ['status'],
        template: 'STATUS#${status}',
        casing: 'none',
      },
      sk: {
        field: 'GSI3_SK',
        composite: ['scheduled_for'],
        template: 'SCHEDULED#${scheduled_for}',
        casing: 'none',
      },
    },
  },
}, {
  table: process.env.ZEIRO_TABLE_NAME,
  client,
})
