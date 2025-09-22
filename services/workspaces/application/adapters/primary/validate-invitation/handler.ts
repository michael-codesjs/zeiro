import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { workspaces, invitationTokens } from '@zeiro/domain'

const handler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  console.log('event', JSON.stringify(event, null, 2))
  
  try {
    const token = event.pathParameters?.token
    
    if (!token) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
          'Access-Control-Allow-Methods': 'GET,OPTIONS',
        },
        body: JSON.stringify({ error: 'Invitation token is required' }),
      }
    }

    // Find the invitation token
    const invitationResult = await invitationTokens.get({
      token: token
    }).go()

    const invitation = invitationResult.data
    
    if (!invitation) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
          'Access-Control-Allow-Methods': 'GET,OPTIONS',
        },
        body: JSON.stringify({ error: 'Invalid invitation token' }),
      }
    }

    // Check if invitation has expired
    const currentTimestamp = Math.floor(Date.now() / 1000)
    if (invitation.expires_at < currentTimestamp) {
      return {
        statusCode: 410,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
          'Access-Control-Allow-Methods': 'GET,OPTIONS',
        },
        body: JSON.stringify({ error: 'Invitation has expired' }),
      }
    }

    // Check if invitation is still pending
    if (invitation.status !== 'pending') {
      return {
        statusCode: 409,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
          'Access-Control-Allow-Methods': 'GET,OPTIONS',
        },
        body: JSON.stringify({ error: 'Invitation has already been used or is no longer valid' }),
      }
    }

    // Get workspace details
    const workspace = await workspaces.get({
      workspace_id: invitation.workspace_id
    }).go()

    if (!workspace.data || workspace.data.discontinued) {
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

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
        'Access-Control-Allow-Methods': 'GET,OPTIONS',
      },
      body: JSON.stringify({
        valid: true,
        workspace: {
          id: workspace.data.id,
          name: workspace.data.name,
          description: workspace.data.description,
        },
        invitation: {
          email: invitation.email,
          role: invitation.role,
          invited_by: invitation.invited_by,
          invited_at: invitation.created_at,
          expires_at: new Date(invitation.expires_at * 1000).toISOString(),
        },
      }),
    }
  } catch (error) {
    console.error('Error validating invitation:', error)
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
        'Access-Control-Allow-Methods': 'GET,OPTIONS',
      },
      body: JSON.stringify({ error: 'Failed to validate invitation' }),
    }
  }
}

/** 'validateInvitation' lambda function handler wrapped in required middleware. */
export const main = handler
