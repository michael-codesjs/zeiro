import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda'
import { dataSources } from '@zeiro/domain'
import { DATA_SOURCE_DELETED_DOMAIN_EVENT } from '@typings/data-source-events'
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
    if (!cognito_user_id) {
      return {
        statusCode: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
          'Access-Control-Allow-Methods': 'DELETE,OPTIONS',
        },
        body: JSON.stringify({ error: 'User not authenticated' }),
      }
    }

    // Validate user and get workspace information
    let user
    try {
      user = await validateAuthenticatedUser(cognito_user_id)
      console.log('Authenticated user:', { user_id: user.user_id, workspace_id: user.workspace_id })
    } catch (authError) {
      console.error('Error validating user:', authError)
      return {
        statusCode: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
          'Access-Control-Allow-Methods': 'DELETE,OPTIONS',
        },
        body: JSON.stringify({ error: 'User authentication failed' }),
      }
    }

    // Get data source ID from path parameters
    const data_source_id = event.pathParameters?.id
    if (!data_source_id) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
          'Access-Control-Allow-Methods': 'DELETE,OPTIONS',
        },
        body: JSON.stringify({ error: 'Data source ID is required' }),
      }
    }

    // First get the data source to verify access and get details for the event
    const getResult = await dataSources.get({
      workspace_id: user.workspace_id,
      id: data_source_id,
    }).go()

    if (!getResult.data) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
          'Access-Control-Allow-Methods': 'DELETE,OPTIONS',
        },
        body: JSON.stringify({ error: 'Data source not found or access denied' }),
      }
    }

    const dataSourceToDelete = getResult.data

    // Verify the data source belongs to the user's workspace
    if (dataSourceToDelete.workspace_id !== user.workspace_id) {
      return {
        statusCode: 403,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
          'Access-Control-Allow-Methods': 'DELETE,OPTIONS',
        },
        body: JSON.stringify({ error: 'Access denied: Data source does not belong to your workspace' }),
      }
    }

    // Now delete the data source
    await dataSources.delete({
      workspace_id: user.workspace_id,
      id: data_source_id,
    }).go()

    console.log('Data source deleted:', data_source_id)

    // Emit domain event
    const domain_event: DATA_SOURCE_DELETED_DOMAIN_EVENT = {
      id: uuidv4(),
      source: 'data-sources.delete-data-source',
      name: 'DATA_SOURCE_DELETED',
      payload: {
        id: data_source_id,
        user_id: user.user_id,
        name: dataSourceToDelete.name,
        type: dataSourceToDelete.type,
      },
      date: new Date(),
    }

    await event_bridge_adapter.publish([domain_event])
    console.log('Domain event emitted:', domain_event)

    return {
      statusCode: 204,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
        'Access-Control-Allow-Methods': 'DELETE,OPTIONS',
      },
      body: '',
    }
    
  } catch (error) {
    console.error('Error deleting data source:', error)
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
        'Access-Control-Allow-Methods': 'DELETE,OPTIONS',
      },
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
    }
  }
}

export const main = handler