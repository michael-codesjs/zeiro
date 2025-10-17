import { Service } from 'electrodb'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'
import {
  User,
  Workspace,
  WorkspaceMembership,
  WorkspaceMembershipCount,
  InvitationToken,
  InvitationReminder,
  Credential,
  DataSource,
  WebSocketConnection,
} from './entities'

// Create DynamoDB Document Client
const ddbClient = new DynamoDBClient({ region: process.env.AWS_REGION })
const docClient = DynamoDBDocumentClient.from(ddbClient, {
  marshallOptions: {
    removeUndefinedValues: true,
  },
})

// Create the service combining all entities
export const zeiro = new Service({
  user: User,
  workspace: Workspace,
  workspaceMembership: WorkspaceMembership,
  workspaceMembershipCount: WorkspaceMembershipCount,
  invitationToken: InvitationToken,
  invitationReminder: InvitationReminder,
  credential: Credential,
  dataSource: DataSource,
  webSocketConnection: WebSocketConnection,
}, {
  table: process.env.ZEIRO_TABLE_NAME || 'zeiro-main-table',
  client: docClient as any,
})

// Export individual entity collections for convenience
export const users = zeiro.entities.user
export const credentials = zeiro.entities.credential
export const dataSources = zeiro.entities.dataSource
export const workspaces = zeiro.entities.workspace
export const workspaceMemberships = zeiro.entities.workspaceMembership
export const workspaceMembershipCounts = zeiro.entities.workspaceMembershipCount
export const invitationTokens = zeiro.entities.invitationToken
export const invitationReminders = zeiro.entities.invitationReminder
export const webSocketConnections = zeiro.entities.webSocketConnection

// Export the entities themselves for direct usage if needed
export { User, Workspace, WorkspaceMembership, WorkspaceMembershipCount, InvitationToken, InvitationReminder, Credential, DataSource, WebSocketConnection }
