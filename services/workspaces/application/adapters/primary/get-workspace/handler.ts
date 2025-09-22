import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda'
import { users, zeiro } from '@zeiro/domain'
import { WorkspaceWithDetails } from '@typings/workspace'

const handler = async (event: APIGatewayProxyEvent,): Promise<APIGatewayProxyResult> => {

  console.log('event', JSON.stringify(event, null, 2))
  
  try {

    const workspace_id = event.pathParameters?.workspaceId
    const cognito_user_id = event.requestContext?.authorizer?.claims?.sub
    
    if (!workspace_id) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
          'Access-Control-Allow-Methods': 'GET,OPTIONS',
        },
        body: JSON.stringify({ error: 'Workspace ID is required' }),
      }
    }

    if (!cognito_user_id) {
      return {
        statusCode: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
          'Access-Control-Allow-Methods': 'GET,OPTIONS',
        },
        body: JSON.stringify({ error: 'User not authenticated' }),
      }
    }

    // Get the user's internal ID from their Cognito ID
    console.log('Looking up user by cognito_user_id:', cognito_user_id)
    const userResult = await users.query
      .byCognitoUser({ cognito_user_id })
      .go()
    
    console.log('User query result:', userResult)
    const user = userResult.data?.[0]
    if (!user) {
      console.error('User not found for cognito_user_id:', cognito_user_id)
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
          'Access-Control-Allow-Methods': 'GET,OPTIONS',
        },
        body: JSON.stringify({ error: 'User not found' }),
      }
    }
    
    const user_id = user.id
    console.log('Found user with internal id:', user_id)

    // Get workspace, memberships, and users in a single ElectroDB collection query
    console.log('Fetching workspace, memberships, and users in single collection query for workspace_id:', workspace_id)
    
    const collectionResult = await zeiro.collections.workspaceData({ workspace_id }).go()

    console.log('ElectroDB collection query result:', collectionResult)

    // Extract workspace, memberships, and users from the collection result
    const workspace = collectionResult.data.workspace?.[0]
    const memberships = collectionResult.data.workspaceMembership || []
    const workspaceUsers = collectionResult.data.user || []

    if (!workspace || !workspace.name) {
      console.error('Workspace not found or invalid:', workspace)
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
          'Access-Control-Allow-Methods': 'GET,OPTIONS',
        },
        body: JSON.stringify({ error: 'Workspace not found' }),
      }
    }

    if (workspace.discontinued) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
          'Access-Control-Allow-Methods': 'GET,OPTIONS',
        },
        body: JSON.stringify({ error: 'Workspace not found' }),
      }
    }

    // Check if user has access to this workspace
    console.log('Looking for membership for user_id:', user_id)
    console.log('Available memberships:', memberships.map(m => ({ user_id: m.user_id, status: m.status, discontinued: m.discontinued })))
    const userMembership = memberships.find(m => m.user_id === user_id && !m.discontinued)
    console.log('Found membership:', userMembership)

    if (!userMembership || userMembership.status !== 'active') {
      console.error('Access denied - membership status:', userMembership?.status, 'discontinued:', userMembership?.discontinued)
      return {
        statusCode: 403,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
          'Access-Control-Allow-Methods': 'GET,OPTIONS',
        },
        body: JSON.stringify({ error: 'Access denied' }),
      }
    }

    console.log('Found memberships:', memberships)
    console.log('Found workspace users:', workspaceUsers)

    // Create a lookup map for users by their ID for efficient matching
    const userLookup = new Map(workspaceUsers.map(user => [user.id, user]))

    // Process memberships and match with user data from the collection
    const members = memberships
      .filter(membership => !membership.discontinued) // Skip discontinued memberships
      .map((membership) => {
        // Handle email-based invitations (user_id starts with EMAIL:)
        if (membership.user_id.startsWith('EMAIL:')) {
          const email = membership.user_id.replace('EMAIL:', '')
          return {
            id: membership.id,
            user_id: membership.user_id,
            name: email, // Use email as name for pending invitations
            email: email,
            role: membership.role,
            status: membership.status,
            invited_by: membership.invited_by,
            joined_at: membership.joined_at,
          }
        }

        // Get user details from the collection data
        const userData = userLookup.get(membership.user_id)
        return {
          id: membership.id,
          user_id: membership.user_id,
          name: userData?.name || membership.metadata?.name || membership.user_id,
          email: userData?.email || membership.metadata?.email || '',
          role: membership.role,
          status: membership.status,
          invited_by: membership.invited_by,
          joined_at: membership.joined_at,
        }
      })
      .sort((a, b) => {
        // Sort by role priority (owner > admin > member > guest), then by joined date
        const roleOrder = { owner: 0, admin: 1, member: 2, guest: 3 }
        const aOrder = roleOrder[a.role] || 4
        const bOrder = roleOrder[b.role] || 4
        
        if (aOrder !== bOrder) {
          return aOrder - bOrder
        }
        
        return new Date(a.joined_at || 0).getTime() - new Date(b.joined_at || 0).getTime()
      })

    const response: WorkspaceWithDetails = {
      id: workspace.id,
      creator_id: workspace.creator_id,
      name: workspace.name,
      description: workspace.description,
      created_at: workspace.created_at,
      updated_at: workspace.updated_at,
      discontinued: workspace.discontinued,
      metadata: workspace.metadata,
      members: members,
      member_count: members.length,
      membership: {
        role: userMembership.role,
        status: userMembership.status,
      },
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
        'Access-Control-Allow-Methods': 'GET,OPTIONS',
      },
      body: JSON.stringify(response),
    }

  } catch (error) {
    console.error('Error getting workspace:', error)
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
        'Access-Control-Allow-Methods': 'GET,OPTIONS',
      },
      body: JSON.stringify({ error: 'Failed to fetch workspace' }),
    }
  }
}

/** 'getWorkspace' lambda function handler wrapped in required middleware. */
export const main = handler
