import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { users, workspaces, workspaceMemberships, invitationTokens, invitationReminders } from '@zeiro/domain'
import { MEMBER_JOINED_DOMAIN_EVENT } from '@typings/domain-events'
import { EventBridgeAdapter } from '@adapters/secondary/event-bridge'
import { v4 as uuidv4 } from 'uuid'

// Initialize EventBridge adapter outside the handler for better performance
const eventBridgeAdapter = new EventBridgeAdapter()

interface AcceptInvitationInput {
  invitation_token: string
  cognito_user_id: string
  user_email: string
}

const handler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  console.log('event', JSON.stringify(event, null, 2))
  
  try {
    // Parse request body
    let input: AcceptInvitationInput
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
    if (!input.invitation_token || !input.cognito_user_id || !input.user_email) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
          'Access-Control-Allow-Methods': 'POST,OPTIONS',
        },
        body: JSON.stringify({ error: 'invitation_token, cognito_user_id, and user_email are required' }),
      }
    }

    // Find the invitation token
    const invitationResult = await invitationTokens.get({
      token: input.invitation_token
    }).go()

    const invitation = invitationResult.data
    
    if (!invitation) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
          'Access-Control-Allow-Methods': 'POST,OPTIONS',
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
          'Access-Control-Allow-Methods': 'POST,OPTIONS',
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
          'Access-Control-Allow-Methods': 'POST,OPTIONS',
        },
        body: JSON.stringify({ error: 'Invitation has already been used or is no longer valid' }),
      }
    }

    // Verify the email matches the invitation
    if (invitation.email !== input.user_email) {
      return {
        statusCode: 403,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
          'Access-Control-Allow-Methods': 'POST,OPTIONS',
        },
        body: JSON.stringify({ error: 'Email does not match invitation' }),
      }
    }

    // Check if workspace exists
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
          'Access-Control-Allow-Methods': 'POST,OPTIONS',
        },
        body: JSON.stringify({ error: 'Workspace not found' }),
      }
    }

    // Check if user already exists in the system
    const existingUserResult = await users.query
      .byCognitoUser({ cognito_user_id: input.cognito_user_id })
      .go()

    let user_id: string

    if (existingUserResult.data.length > 0) {
      // User already exists, use their existing ID
      user_id = existingUserResult.data[0].id
    } else {
      // Create a new user record in the workspace
      user_id = uuidv4()
      await users.create({
        id: user_id,
        workspace_id: invitation.workspace_id,
        cognito_user_id: input.cognito_user_id,
        name: input.user_email.split('@')[0], // Use email prefix as default name
        email: input.user_email,
        email_verified: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        discontinued: false,
      }).go()
    }

    // Update the membership to activate it
    const now = new Date()
    const updatedMembership = await workspaceMemberships.update({
      workspace_id: invitation.workspace_id,
      user_id: `EMAIL:${invitation.email}`, // Use the original placeholder user_id
    }).set({
      user_id: user_id, // Update to the actual user ID
      status: 'active',
      joined_at: now.toISOString(),
      updated_at: now.toISOString(),
    }).go()

    // Update the invitation token status
    await invitationTokens.update({
      token: input.invitation_token
    }).set({
      status: 'accepted',
      accepted_at: now.toISOString(),
      accepted_by_cognito_user_id: input.cognito_user_id,
    }).go()

    // Cancel all pending reminders for this invitation
    const pendingReminders = await invitationReminders.query
      .byToken({ invitation_token: input.invitation_token })
      .where(({ status }, { eq }) => eq(status, 'pending'))
      .go()

    for (const reminder of pendingReminders.data) {
      await invitationReminders.update({
        id: reminder.id
      }).set({
        status: 'cancelled',
      }).go()
    }

    // Publish domain event
    const memberJoinedEvent: MEMBER_JOINED_DOMAIN_EVENT = {
      id: uuidv4(),
      source: 'zeiro.domain.workspaces.services.membership',
      name: 'MEMBER_JOINED',
      payload: {
        workspace_id: invitation.workspace_id,
        user_id: user_id,
        membership_id: invitation.membership_id,
        role: invitation.role,
      },
      date: new Date(),
    }

    await eventBridgeAdapter.publish([memberJoinedEvent])

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
        'Access-Control-Allow-Methods': 'POST,OPTIONS',
      },
      body: JSON.stringify({
        success: true,
        workspace: {
          id: workspace.data.id,
          name: workspace.data.name,
        },
        membership: {
          id: invitation.membership_id,
          role: invitation.role,
          status: 'active',
        },
        user_id: user_id,
      }),
    }
  } catch (error) {
    console.error('Error accepting invitation:', error)
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
        'Access-Control-Allow-Methods': 'POST,OPTIONS',
      },
      body: JSON.stringify({ error: 'Failed to accept invitation' }),
    }
  }
}

/** 'acceptInvitation' lambda function handler wrapped in required middleware. */
export const main = handler
