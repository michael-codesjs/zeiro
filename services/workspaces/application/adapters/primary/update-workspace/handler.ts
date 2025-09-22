import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { users, workspaces } from '@zeiro/domain'
import { UpdateWorkspaceInput } from '@typings/workspace'
import { EventBridgeAdapter } from '@adapters/secondary/event-bridge'
import { v4 as uuidv4 } from 'uuid'

const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Update workspace event:', JSON.stringify(event, null, 2))
  
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
          'Access-Control-Allow-Methods': 'PUT,OPTIONS',
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
          'Access-Control-Allow-Methods': 'PUT,OPTIONS',
        },
        body: JSON.stringify({ error: 'User not authenticated' }),
      }
    }

    // Parse request body
    let input: UpdateWorkspaceInput
    try {
      input = JSON.parse(event.body || '{}')
    } catch (parseError) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
          'Access-Control-Allow-Methods': 'PUT,OPTIONS',
        },
        body: JSON.stringify({ error: 'Invalid JSON in request body' }),
      }
    }

    // Validate input
    if (!input.name && !input.description && !input.metadata) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
          'Access-Control-Allow-Methods': 'PUT,OPTIONS',
        },
        body: JSON.stringify({ error: 'At least one field (name, description, or metadata) must be provided' }),
      }
    }

    if (input.name && (typeof input.name !== 'string' || input.name.trim().length === 0)) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
          'Access-Control-Allow-Methods': 'PUT,OPTIONS',
        },
        body: JSON.stringify({ error: 'Workspace name must be a non-empty string' }),
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
          'Access-Control-Allow-Methods': 'PUT,OPTIONS',
        },
        body: JSON.stringify({ error: 'User not found' }),
      }
    }
    
    const user_id = user.id
    console.log('Found user with internal id:', user_id)

    // Get the existing workspace to check permissions and current state
    console.log('Fetching workspace for update:', workspace_id)
    const workspaceResult = await workspaces.get({ workspace_id }).go()
    
    if (!workspaceResult.data) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
          'Access-Control-Allow-Methods': 'PUT,OPTIONS',
        },
        body: JSON.stringify({ error: 'Workspace not found' }),
      }
    }

    const existingWorkspace = workspaceResult.data

    if (existingWorkspace.discontinued) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
          'Access-Control-Allow-Methods': 'PUT,OPTIONS',
        },
        body: JSON.stringify({ error: 'Workspace not found' }),
      }
    }

    // Check if user has permission to update the workspace
    // For now, we'll check if they're the creator. In the future, we might want to check membership roles
    if (existingWorkspace.creator_id !== user_id) {
      return {
        statusCode: 403,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
          'Access-Control-Allow-Methods': 'PUT,OPTIONS',
        },
        body: JSON.stringify({ error: 'Access denied. Only the workspace creator can update the workspace.' }),
      }
    }

    // Prepare update data
    const updateData: any = {}
    
    if (input.name !== undefined) {
      updateData.name = input.name.trim()
    }
    
    if (input.description !== undefined) {
      updateData.description = input.description
    }
    
    if (input.metadata !== undefined) {
      updateData.metadata = input.metadata
    }

    // Update the workspace
    console.log('Updating workspace with data:', updateData)
    const updatedWorkspace = await workspaces.patch({ workspace_id }).set(updateData).go()

    console.log('Workspace updated successfully:', updatedWorkspace.data)

    // Initialize EventBridge adapter for domain events
    const eventBridgeAdapter = new EventBridgeAdapter()

    // Publish workspace updated domain event
    const workspaceUpdatedEvent = {
      id: uuidv4(),
      source: 'zeiro.domain.workspaces.services.workspace',
      name: 'WORKSPACE_UPDATED',
      payload: updatedWorkspace.data,
      date: new Date(),
    }

    await eventBridgeAdapter.publish([workspaceUpdatedEvent])

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
        'Access-Control-Allow-Methods': 'PUT,OPTIONS',
      },
      body: JSON.stringify({
        message: 'Workspace updated successfully',
        workspace: updatedWorkspace.data,
      }),
    }

  } catch (error) {
    console.error('Error updating workspace:', error)
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
        'Access-Control-Allow-Methods': 'PUT,OPTIONS',
      },
      body: JSON.stringify({ error: 'Failed to update workspace' }),
    }
  }
}

/** 'updateWorkspace' lambda function handler wrapped in required middleware. */
export const main = handler
