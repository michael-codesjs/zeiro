import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda'
import { workspaces, workspaceMemberships } from '@zeiro/domain'
import { EventBridgeAdapter } from '@adapters/secondary/event-bridge'
import { WORKSPACE_CREATED_DOMAIN_EVENT, MEMBER_JOINED_DOMAIN_EVENT } from '@typings/domain-events'
import { v4 as uuidv4 } from 'uuid'

interface CreateDefaultWorkspaceInput {
  user_id: string
  user_name: string
  user_email: string
}

const handler = async (
  event: APIGatewayProxyEvent,
  context: Context,
): Promise<APIGatewayProxyResult> => {
  console.log('Creating default workspace for new user:', JSON.stringify(event, null, 2))

  try {

    // Parse request body
    let input: CreateDefaultWorkspaceInput
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

    const userId = input.user_id
    const userName = input.user_name
    const userEmail = input.user_email

    // Initialize EventBridge adapter
    const eventBridgeAdapter = new EventBridgeAdapter()

    const workspace_id = uuidv4()
    const membership_id = uuidv4()
    const now = new Date()

    // Create the default personal workspace
    const workspaceName = `${userName}'s Workspace`
    const workspace = await workspaces.create({
      id: workspace_id,
      workspace_id: workspace_id,
      creator_id: userId,
      name: workspaceName,
      description: `${userName}'s personal workspace`,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
      discontinued: false,
      metadata: {
        type: 'personal',
        auto_created: true,
        created_for_user: userId,
      },
    }).go()

    // Create the owner membership
    const membership = await workspaceMemberships.create({
      id: membership_id,
      workspace_id: workspace_id,
      user_id: userId,
      role: 'owner',
      status: 'active',
      joined_at: now.toISOString(),
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
      discontinued: false,
      metadata: {
        auto_created: true,
        name: userName,
        email: userEmail,
      },
    }).go()

    // Publish domain events
    const workspaceCreatedEvent: WORKSPACE_CREATED_DOMAIN_EVENT = {
      id: uuidv4(),
      source: 'zeiro.domain.workspaces.services.workspace',
      name: 'WORKSPACE_CREATED',
      payload: workspace as any,
      date: new Date(),
    }

    const memberJoinedEvent: MEMBER_JOINED_DOMAIN_EVENT = {
      id: uuidv4(),
      source: 'zeiro.domain.workspaces.services.membership',
      name: 'MEMBER_JOINED',
      payload: membership as any,
      date: new Date(),
    }

    await eventBridgeAdapter.publish([workspaceCreatedEvent, memberJoinedEvent])

    console.log(`Successfully created default workspace "${workspaceName}" for user ${userId}`)

    return {
      statusCode: 201,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
        'Access-Control-Allow-Methods': 'POST,OPTIONS',
      },
      body: JSON.stringify({
        message: 'Default workspace created successfully',
        workspace_id: workspace_id,
        user_id: userId,
      }),
    }

  } catch (error) {
    console.error('Error creating default workspace:', error)
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
        'Access-Control-Allow-Methods': 'POST,OPTIONS',
      },
      body: JSON.stringify({ error: 'Failed to create default workspace' }),
    }
  }
}

/** 'createDefaultWorkspace' lambda function handler wrapped in required middleware. */
export const main = handler