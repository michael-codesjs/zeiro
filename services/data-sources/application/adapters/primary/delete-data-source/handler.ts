import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda'
import { dataSources } from '@adapters/secondary/one-table'
import { DATA_SOURCE_DELETED_DOMAIN_EVENT } from '@typings/data-source-events'
import { withLambdaIOStandard } from '@zeiro/sdk'
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
    // Extract user_id from Cognito authorizer context
    const user_id = event.requestContext?.authorizer?.claims?.sub
    if (!user_id) {
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

    // First, get the data source to verify ownership and get details for the event
    const existingDataSource = await dataSources.get({
      user_id,
      id: data_source_id,
    })

    if (!existingDataSource) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
          'Access-Control-Allow-Methods': 'DELETE,OPTIONS',
        },
        body: JSON.stringify({ error: 'Data source not found' }),
      }
    }

    // Delete the data source
          await dataSources.remove({
      user_id,
      id: data_source_id,
    })

    console.log('Data source deleted:', data_source_id)

    // Emit domain event
    const domain_event: DATA_SOURCE_DELETED_DOMAIN_EVENT = {
      id: uuidv4(),
              source: 'data-sources.delete-data-source',
      name: 'DATA_SOURCE_DELETED',
      payload: {
        id: data_source_id,
        user_id,
        name: existingDataSource.name,
        type: existingDataSource.type,
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