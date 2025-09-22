import { User } from '@typings/user'
import {
  withCommonInput,
  withLambdaIOStandard,
  CommonInputHandler,
  apiGatewaySignedFetch,
} from '@zeiro/sdk'
import { v4 as uuidv4 } from 'uuid'
import { EventBridgeAdapter } from '@adapters/secondary/event-bridge'
import { USER_CREATED_DOMAIN_EVENT } from '@typings/domain-events'
import { users, workspaces, workspaceMemberships, invitationTokens, invitationReminders } from '@zeiro/domain'
import { CREATE_USER_COMMAND } from '@typings/commands'

/**
 * Accept invitation and return workspace_id
 */
const acceptInvitation = async (
  invitationToken: string,
  cognitoUserId: string,
  userEmail: string,
  userId: string
): Promise<string> => {
  // Find the invitation token
  const invitationResult = await invitationTokens.get({
    token: invitationToken
  }).go()

  const invitation = invitationResult.data
  
  if (!invitation) {
    console.error('Invalid invitation token:', invitationToken)
    throw new Error('Invalid invitation token')
  }

  // Check if invitation has expired
  const currentTimestamp = Math.floor(Date.now() / 1000)
  if (invitation.expires_at < currentTimestamp) {
    console.error('Invitation has expired:', invitationToken)
    throw new Error('Invitation has expired')
  }

  // Check if invitation is still pending
  if (invitation.status !== 'pending') {
    console.error('Invitation is not pending:', invitation.status)
    throw new Error('Invitation is not pending')
  }

  // Verify the email matches the invitation
  if (invitation.email !== userEmail) {
    console.error('Email does not match invitation:', userEmail, invitation.email)
    throw new Error('Email does not match invitation')
  }

  // Get the existing membership and recreate it with the actual user_id
  const now = new Date()
  const existingMembership = await workspaceMemberships.get({
    workspace_id: invitation.workspace_id,
    user_id: `EMAIL:${invitation.email}`,
  }).go()

  if (existingMembership.data) {
    // Delete the placeholder membership
    await workspaceMemberships.delete({
      workspace_id: invitation.workspace_id,
      user_id: `EMAIL:${invitation.email}`,
    }).go()

    // Create new membership with actual user_id
    await workspaceMemberships.create({
      ...existingMembership.data,
      user_id: userId,
      status: 'active',
      joined_at: now.toISOString(),
      updated_at: now.toISOString(),
    }).go()
  }

  // Update the invitation token status
  await invitationTokens.update({
    token: invitationToken
  }).set({
    status: 'accepted',
    accepted_at: now.toISOString(),
    accepted_by_cognito_user_id: cognitoUserId,
  }).go()

  // Cancel all pending reminders for this invitation
  const pendingReminders = await invitationReminders.query
    .byToken({ invitation_token: invitationToken })
    .where(({ status }, { eq }) => eq(status, 'pending'))
    .go()

  for (const reminder of pendingReminders.data) {
    await invitationReminders.update({
      id: reminder.id
    }).set({
      status: 'cancelled',
    }).go()
  }

  console.log('Successfully accepted invitation for user:', userEmail)
  return invitation.workspace_id
}

/**
 * Create default workspace for new user
 */
const createDefaultWorkspace = async (
  userId: string,
  userName: string,
  userEmail: string
): Promise<string> => {
  try {
    const workspaceResponse = await apiGatewaySignedFetch(`${process.env.WORKSPACE_API_URL || 'https://api.usezeiro.com'}/workspaces/default`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        user_name: userName,
        user_email: userEmail,
      }),
    })

    if (!workspaceResponse.ok) {
      console.error('Failed to create default workspace:', await workspaceResponse.text())
      throw new Error('Failed to create default workspace')
    }

    const workspaceData = await workspaceResponse.json()
    console.log('Default workspace created successfully')
    return workspaceData.workspace_id
  } catch (workspaceError) {
    console.error('Error calling workspace service:', workspaceError)
    throw new Error('Failed to create default workspace for user')
  }
}

const inputMapper = async (
  input: CREATE_USER_COMMAND,
): Promise<User> => {

  // Initialize EventBridge adapter outside the handler for better performance
  const eventBridgeAdapter = new EventBridgeAdapter()

  const id = uuidv4() // generate own internal id, do not use cognito id
  const cognito_user_id = input.payload.id
  const invitation_token = input.payload.invitation_token

  console.log('input', JSON.stringify(input, null, 2))

  let workspace_id = ''

  if (invitation_token) {
    // Accept invitation and join existing workspace
    workspace_id = await acceptInvitation(invitation_token, cognito_user_id, input.payload.email, id)
  } else {
    // Create default workspace for new user
    workspace_id = await createDefaultWorkspace(id, input.payload.name, input.payload.email)
  }

  const user = await users.create({
    ...input.payload,
    id,
    workspace_id: workspace_id,
    cognito_user_id,
    created_at: new Date().toJSON(),
    updated_at: new Date().toJSON(),
    discontinued: false,
    password: '',
  }).go()
  
  const event: USER_CREATED_DOMAIN_EVENT = {
    id,
    source: 'zeiro.domain.user.services.user',
    name: 'USER_CREATED',
    payload: user,
    date: new Date(),
  }
  
  await eventBridgeAdapter.publish([event])
  
  return user as unknown as User

}

/** 'createUser' lambda function handler. */
export const handler: CommonInputHandler<CREATE_USER_COMMAND, User> =
  withCommonInput(inputMapper, {
    singular: true as true,
  })

/** 'createUser' lambda function handler wrapped in required middleware. */
export const main = withLambdaIOStandard(handler)
