import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda'
import { users, workspaces, workspaceMemberships, invitationTokens, invitationReminders } from '@zeiro/domain'
import { InviteMemberInput, WorkspaceMembership } from '@typings/workspace'
import { MEMBER_INVITED_DOMAIN_EVENT } from '@typings/domain-events'
import { EventBridgeAdapter } from '@adapters/secondary/event-bridge'
import { sendEmail } from '@zeiro/sdk'
import { createInvitationEmail } from '@templates/invitation-email'
import { v4 as uuidv4 } from 'uuid'
import { randomBytes } from 'crypto'

// Initialize EventBridge adapter outside the handler for better performance
const eventBridgeAdapter = new EventBridgeAdapter()

/**
 * Generates a secure invitation token
 * @returns A URL-safe base64 encoded token
 */
const generateInvitationToken = (): string => {
  // Generate 32 random bytes and encode as URL-safe base64
  return randomBytes(32).toString('base64url')
}

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

    // Check if user already exists in the platform by email
    const existingUsersResult = await users.query
      .byEmail({ email: input.email })
      .go()

    if (existingUsersResult.data.length > 0) {
      return {
        statusCode: 409,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
          'Access-Control-Allow-Methods': 'POST,OPTIONS',
        },
        body: JSON.stringify({ 
          error: 'User already exists with this email' 
        }),
      }
    }

    // Check if there's already a pending invitation for this email in this workspace
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
    const invitationToken = generateInvitationToken()
    
    // Set invitation expiration to 7 days from now
    const invitationExpiry = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    const expiryTimestamp = Math.floor(invitationExpiry.getTime() / 1000) // Unix timestamp for TTL

    // Create the membership (pending if user doesn't exist yet)
    const membership = await workspaceMemberships.create({
      id: membership_id,
      workspace_id: workspace_id,
      user_id: `EMAIL:${input.email}`, // Temporary placeholder until user accepts invitation
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

    // Create the invitation token entity
    const invitationTokenRecord = await invitationTokens.create({
      token: invitationToken,
      workspace_id: workspace_id,
      membership_id: membership_id,
      email: input.email,
      role: input.role,
      invited_by: user_id,
      status: 'pending',
      expires_at: expiryTimestamp,
      invitation_message: input.message,
    }).go()

    // Create reminder schedules (3 days, 6 days, and 7 days after invitation)
    const reminderSchedules = [
      { type: 'first_reminder', days: 3 },
      { type: 'second_reminder', days: 6 },
      { type: 'final_reminder', days: 7 },
    ]

    for (const schedule of reminderSchedules) {
      const scheduledTime = new Date(now.getTime() + schedule.days * 24 * 60 * 60 * 1000)
      const scheduledTimestamp = Math.floor(scheduledTime.getTime() / 1000)
      
      await invitationReminders.create({
        id: uuidv4(),
        invitation_token: invitationToken,
        workspace_id: workspace_id,
        membership_id: membership_id,
        email: input.email,
        invited_by: user_id,
        reminder_type: schedule.type as 'first_reminder' | 'second_reminder' | 'final_reminder',
        reminder_count: 0,
        status: 'pending',
        scheduled_for: scheduledTimestamp,
        ttl: scheduledTimestamp + 86400, // TTL 1 day after scheduled time
      }).go()
    }

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

    // Generate the invitation URL
    const baseUrl = process.env.MARKETING_URL || 'https://usezeiro.com'
    const invitationUrl = `${baseUrl}/auth/up?invitation=${invitationToken}&workspace=${workspace_id}`

    // Send invitation email
    try {
      const invitationEmail = createInvitationEmail({
        to: {
          email: input.email,
          name: input.email.split('@')[0] // Use email prefix as fallback name
        },
        from: {
          email: 'noreply@usezeiro.com',
          name: 'Zeiro'
        },
        workspaceName: workspace.data.name,
        inviterName: user.name || user.email,
        invitationUrl,
        role: input.role,
        message: input.message
      })

      const emailResult = await sendEmail(invitationEmail)
      
      if (!emailResult.success) {
        console.error('Failed to send invitation email:', emailResult.error)
        // Don't fail the entire request if email fails, just log it
      } else {
        console.log('Invitation email sent successfully:', emailResult.messageId)
      }
    } catch (emailError) {
      console.error('Error sending invitation email:', emailError)
      // Don't fail the entire request if email fails, just log it
    }

    return {
      statusCode: 201,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
        'Access-Control-Allow-Methods': 'POST,OPTIONS',
      },
      body: JSON.stringify({
        ...membership,
        invitation_url: invitationUrl,
        invitation_token: invitationToken, // Include token for debugging/testing
      }),
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