import { Entity } from 'electrodb'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

const client = new DynamoDBClient({ region: process.env.AWS_REGION })

export const InvitationToken = new Entity({
  model: {
    entity: 'InvitationToken',
    version: '1',
    service: 'zeiro',
  },
  attributes: {
    token: {
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
    role: {
      type: ['owner', 'admin', 'member', 'guest'] as const,
      required: true,
    },
    invited_by: {
      type: 'string',
      required: true,
    },
    status: {
      type: ['pending', 'accepted', 'expired', 'revoked'] as const,
      required: true,
      default: 'pending',
    },
    expires_at: {
      type: 'number', // Unix timestamp for TTL
      required: true,
    },
    invitation_message: {
      type: 'string',
    },
    accepted_at: {
      type: 'string', // ISO string
    },
    accepted_by_cognito_user_id: {
      type: 'string',
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
    byToken: {
      pk: {
        field: 'PK',
        composite: ['token'],
        template: 'INVITATION_TOKEN#${token}',
        casing: 'none',
      },
      sk: {
        field: 'SK',
        composite: ['token'],
        template: 'INVITATION_TOKEN#${token}',
        casing: 'none',
      },
    },
    byWorkspace: {
      index: 'GSI1',
      pk: {
        field: 'GSI1_PK',
        composite: ['workspace_id'],
        template: 'WORKSPACE#${workspace_id}',
        casing: 'none',
      },
      sk: {
        field: 'GSI1_SK',
        composite: ['created_at'],
        template: 'INVITATION#${created_at}',
        casing: 'none',
      },
    },
    byMembership: {
      index: 'GSI2',
      pk: {
        field: 'GSI2_PK',
        composite: ['membership_id'],
        template: 'MEMBERSHIP#${membership_id}',
        casing: 'none',
      },
      sk: {
        field: 'GSI2_SK',
        composite: ['token'],
        template: 'TOKEN#${token}',
        casing: 'none',
      },
    },
    byEmail: {
      index: 'GSI3',
      pk: {
        field: 'GSI3_PK',
        composite: ['email'],
        template: 'EMAIL#${email}',
        casing: 'none',
      },
      sk: {
        field: 'GSI3_SK',
        composite: ['workspace_id', 'created_at'],
        template: 'WORKSPACE#${workspace_id}#${created_at}',
        casing: 'none',
      },
    },
  },
}, {
  table: process.env.ZEIRO_TABLE_NAME,
  client,
})
