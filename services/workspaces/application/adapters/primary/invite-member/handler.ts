import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda'
import { users, workspaces, workspaceMemberships } from '@zeiro/domain'
import { InviteMemberInput, WorkspaceMembership } from '@typings/workspace'
import { MEMBER_INVITED_DOMAIN_EVENT } from '@typings/domain-events'
import { EventBridgeAdapter } from '@adapters/secondary/event-bridge'
import { v4 as uuidv4 } from 'uuid'

// Initialize EventBridge adapter outside the handler for better performance
const eventBridgeAdapter = new EventBridgeAdapter()

const handler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  console.log('event', JSON.stringify(event, null, 2))
  
  try {
    // Extract cognito_user_id from Cognito authorizer context
    const cognito_user_id = event.requestContext?.authorizer?.claims?.sub
    const workspace_id = event.pathParameters?.workspaceId
    
    if (!cognito_user_id) {
      return {
        statusCode: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
          'Access-Control-Allow-Methods': 'POST,OPTIONS',
        },
        body: JSON.stringify({ error: 'User not authenticated' }),
      }
    }

    // Get the user's internal ID from their Cognito ID
    const userResult = await users.query
      .byCognitoUser({ cognito_user_id })
      .go()
    
    const user = userResult.data?.[0]
    if (!user) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
          'Access-Control-Allow-Methods': 'POST,OPTIONS',
        },
        body: JSON.stringify({ error: 'User not found' }),
      }
    }
    
    const user_id = user.id

    if (!workspace_id) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
          'Access-Control-Allow-Methods': 'POST,OPTIONS',
        },
        body: JSON.stringify({ error: 'Workspace ID is required' }),
      }
    }

    // Parse request body
    let input: InviteMemberInput
    try {
      input = JSON.parse(event.body || '{}')
    } catch (parseError) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
          'Access-Control-Allow-Methods': 'POST,OPTIONS',
        },
        body: JSON.stringify({ error: 'Invalid JSON in request body' }),
      }
    }

    // Validate required fields
    if (!input.email || !input.role) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
          'Access-Control-Allow-Methods': 'POST,OPTIONS',
        },
        body: JSON.stringify({ error: 'Email and role are required' }),
      }
    }

    // Check if workspace exists
    const workspace = await workspaces.get({
      workspace_id: workspace_id
    }).go()

    if (!workspace.data || workspace.data.discontinued) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
          'Access-Control-Allow-Methods': 'POST,OPTIONS',
        },
        body: JSON.stringify({ error: 'Workspace not found' }),
      }
    }

    // Check if inviter has permission (owner or admin)
    const inviterMembership = await workspaceMemberships.get({
      workspace_id: workspace_id,
      user_id: user_id
    }).go()

    if (!inviterMembership.data || !['owner', 'admin'].includes(inviterMembership.data.role)) {
      return {
        statusCode: 403,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
          'Access-Control-Allow-Methods': 'POST,OPTIONS',
        },
        body: JSON.stringify({ error: 'Insufficient permissions to invite members' }),
      }
    }

    // Check if user exists by email
    // Note: We can't directly query users by email since it requires workspace_id
    // For invitations, we'll use email as a placeholder user_id
    let target_user_id: string | null = null
    
    // For now, we'll check if there's already a membership with this email
    const existingMembershipsResult = await workspaceMemberships.query
      .byWorkspace({ workspace_id })
      .where(({ metadata }, { eq }) => eq(metadata.email, input.email))
      .go()

    if (existingMembershipsResult.data.length > 0) {
      const existingMembership = existingMembershipsResult.data[0]

      if (existingMembership && !existingMembership.discontinued) {
        return {
          statusCode: 409,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
            'Access-Control-Allow-Methods': 'POST,OPTIONS',
          },
          body: JSON.stringify({ error: 'User is already a member of this workspace' }),
        }
      }
    }

    const membership_id = uuidv4()
    const now = new Date()

    // Create the membership (pending if user doesn't exist yet)
    const membership = await workspaceMemberships.create({
      id: membership_id,
      workspace_id: workspace_id,
      user_id: target_user_id || `EMAIL:${input.email}`, // Temporary placeholder
      role: input.role,
      status: 'pending', // Always pending until accepted
      invited_by: user_id,
      invited_at: now.toISOString(),
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
      discontinued: false,
      metadata: {
        email: input.email,
        invitation_message: input.message,
      },
    }).go()

    // Publish domain event
    const memberInvitedEvent: MEMBER_INVITED_DOMAIN_EVENT = {
      id: uuidv4(),
      source: 'zeiro.domain.workspaces.services.membership',
      name: 'MEMBER_INVITED',
      payload: {
        workspace_id: workspace_id,
        email: input.email,
        role: input.role,
        invited_by: user_id,
        membership_id: membership_id,
      },
      date: new Date(),
    }

    await eventBridgeAdapter.publish([memberInvitedEvent])

    return {
      statusCode: 201,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
        'Access-Control-Allow-Methods': 'POST,OPTIONS',
      },
      body: JSON.stringify(membership),
    }
  } catch (error) {
    console.error('Error inviting member:', error)
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
        'Access-Control-Allow-Methods': 'POST,OPTIONS',
      },
      body: JSON.stringify({ error: 'Failed to invite member' }),
    }
  }
}

/** 'inviteMember' lambda function handler wrapped in required middleware. */
export const main = handler