import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda'
import { dataSources } from '@zeiro/domain'
import { UpdateDataSourceInput } from '@typings/data-source'
import { DATA_SOURCE_UPDATED_DOMAIN_EVENT } from '@typings/data-source-events'
import { validateAuthenticatedUser } from '@zeiro/sdk'
import { EventBridgeAdapter } from '@adapters/secondary/event-bridge'
import { v4 as uuidv4 } from 'uuid'

// Initialize EventBridge adapter outside the handler for better performance
const event_bridge_adapter = new EventBridgeAdapter()

const handler = async (
  event: APIGatewayProxyEvent,
  context: Context,
): Promise<APIGatewayProxyResult> => {
  console.log('event', JSON.stringify(event, null, 2))
  
  try {
    // Extract cognito_user_id from Cognito authorizer context
    const cognito_user_id = event.requestContext?.authorizer?.claims?.sub
    const data_source_id = event.pathParameters?.id

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

    if (!data_source_id) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
          'Access-Control-Allow-Methods': 'PUT,OPTIONS',
        },
        body: JSON.stringify({ error: 'Data source ID is required' }),
      }
    }

    // Validate user and get workspace information
    let user
    try {
      user = await validateAuthenticatedUser(cognito_user_id)
      console.log('Authenticated user:', { user_id: user.id, workspace_id: user.workspace_id })
    } catch (authError) {
      console.error('Error validating user:', authError)
      return {
        statusCode: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
          'Access-Control-Allow-Methods': 'PUT,OPTIONS',
        },
        body: JSON.stringify({ error: 'User authentication failed' }),
      }
    }

    // Parse request body
    let input: UpdateDataSourceInput
    try {
      input = JSON.parse(event.body || '{}')
      console.log('Parsed input:', JSON.stringify(input, null, 2))
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

    // Check if data source exists and belongs to user
    const existingDataSource = await dataSources.get({
      user_id: user.id,
      id: data_source_id
    }).go()

    if (!existingDataSource.data) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
          'Access-Control-Allow-Methods': 'PUT,OPTIONS',
        },
        body: JSON.stringify({ error: 'Data source not found' }),
      }
    }

    // Prepare update data - only include fields that are provided
    const updateData: any = {}
    if (input.name !== undefined) updateData.name = input.name
    if (input.description !== undefined) updateData.description = input.description
    if (input.connection_config !== undefined) updateData.connection_config = input.connection_config
    
    // Always update the timestamp
    updateData.updated_at = new Date().toISOString()

    // Update data source
    const result = await dataSources.update({
      user_id: user.id,
      id: data_source_id
    }).set(updateData).go()

    const updatedDataSource = result.data
    console.log('Data source updated:', updatedDataSource)

    // Emit domain event
    const data_source_updated_event: DATA_SOURCE_UPDATED_DOMAIN_EVENT = {
      id: uuidv4(),
      source: 'data-sources.update-data-source',
      name: 'DATA_SOURCE_UPDATED',
      payload: {
        id: data_source_id,
        user_id: user.id,
        workspace_id: user.workspace_id,
        name: updatedDataSource.name,
        type: updatedDataSource.type,
        changes: Object.keys(updateData).filter(key => key !== 'updated_at'),
      },
      date: new Date(),
    }

    await event_bridge_adapter.publish([data_source_updated_event])
    console.log('Domain event emitted:', data_source_updated_event)

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
        'Access-Control-Allow-Methods': 'PUT,OPTIONS',
      },
      body: JSON.stringify(updatedDataSource),
    }
    
  } catch (error) {
    console.error('Error updating data source:', error)
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
        'Access-Control-Allow-Methods': 'PUT,OPTIONS',
      },
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
    }
  }
}

export const main = handler
