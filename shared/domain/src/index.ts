import { Service } from 'electrodb'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'
import { User, Workspace, WorkspaceMembership, WorkspaceMembershipCount } from './entities'

// Create DynamoDB Document Client
const ddbClient = new DynamoDBClient({ region: process.env.AWS_REGION })
const docClient = DynamoDBDocumentClient.from(ddbClient)

// Create the service combining all entities
export const zeiro = new Service({
  user: User,
  workspace: Workspace,
  workspaceMembership: WorkspaceMembership,
  workspaceMembershipCount: WorkspaceMembershipCount,
}, {
  table: process.env.ZEIRO_TABLE_NAME,
  client: docClient as any,
})

// Export individual entity collections for convenience
export const users = zeiro.entities.user
export const workspaces = zeiro.entities.workspace
export const workspaceMemberships = zeiro.entities.workspaceMembership
export const workspaceMembershipCounts = zeiro.entities.workspaceMembershipCount

// Export the entities themselves for direct usage if needed
export { User, Workspace, WorkspaceMembership, WorkspaceMembershipCount }
