import { Entity } from 'electrodb'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

const client = new DynamoDBClient({ region: process.env.AWS_REGION })

export const User = new Entity({
  model: {
    entity: 'User',
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
    cognito_user_id: {
      type: 'string',
      required: true,
    },
    name: {
      type: 'string',
      required: true,
    },
    email: {
      type: 'string',
      required: true,
    },
    email_verified: {
      type: 'boolean',
      default: false,
    },
    password: {
      type: 'string',
    },
    entity_type: {
      type: 'string',
      default: 'USER',
      readOnly: true,
    },
    creator_id: {
      type: 'string',
      watch: ['id'],
      set: (_, { id }) => id,
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
        casing: 'none',  // Preserve the case in template
      },
      sk: {
        field: 'SK',
        composite: ['id'],
        template: 'USER#${id}',
        casing: 'none',  // Preserve the case in template
      },
    },
    byCognitoUser: {
      index: 'GSI1',
      sparse: false,  // Always populate this index
      pk: {
        field: 'GSI1_PK',
        composite: ['cognito_user_id'],
        template: 'COGNITO_USER#${cognito_user_id}',
        casing: 'none',  // Preserve the case in template
      },
      sk: {
        field: 'GSI1_SK', 
        composite: ['cognito_user_id'],
        template: 'COGNITO_USER#${cognito_user_id}',
        casing: 'none',  // Preserve the case in template
      },
    },
    byEmail: {
      index: 'GSI2',
      sparse: false,  // Always populate this index
      pk: {
        field: 'GSI2_PK',
        composite: ['email'],
        template: 'EMAIL#${email}',
        casing: 'none',  // Preserve the case in template
      },
      sk: {
        field: 'GSI2_SK',
        composite: ['workspace_id'],
        template: 'WORKSPACE#${workspace_id}',
        casing: 'none',  // Preserve the case in template
      },
    },
  },
}, { 
  table: process.env.ZEIRO_TABLE_NAME,
  client,
})
