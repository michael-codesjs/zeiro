import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda'
import { dataSources } from '@adapters/secondary/one-table'
import { CreateDataSourceInput, DataSource } from '@typings/data-source'
import { DATA_SOURCE_CREATED_DOMAIN_EVENT } from '@typings/data-source-events'
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
          'Access-Control-Allow-Methods': 'POST,OPTIONS',
        },
        body: JSON.stringify({ error: 'User not authenticated' }),
      }
    }

    // Parse request body
    let input: CreateDataSourceInput
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
    if (!input.name || !input.type || !input.credential_id || !input.connection_config) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
          'Access-Control-Allow-Methods': 'POST,OPTIONS',
        },
        body: JSON.stringify({ error: 'Missing required fields: name, type, credential_id, connection_config' }),
      }
    }

    // Create data source record
    const data_source_id = uuidv4()
    const now = new Date().toISOString()
    
    const dataSource: DataSource = {
      id: data_source_id,
      user_id,
      name: input.name,
      description: input.description,
      type: input.type,
      status: input.status || 'disconnected',
      environment: input.environment || 'development',
      credential_id: input.credential_id,
      connection_config: input.connection_config,
      auto_connect: input.auto_connect || false,
      created_at: now,
      updated_at: now,
    }

    // Save to database
    const savedDataSource = await dataSources.create(dataSource as unknown as never)
    console.log('Data source created:', savedDataSource)

    // Emit domain event
    const domain_event: DATA_SOURCE_CREATED_DOMAIN_EVENT = {
      id: uuidv4(),
      source: 'data-sources.create-data-source',
      name: 'DATA_SOURCE_CREATED',
      payload: {
        id: data_source_id,
        user_id,
        name: input.name,
        type: input.type,
        environment: input.environment || 'development',
        credential_id: input.credential_id,
      },
      date: new Date(),
    }

    await event_bridge_adapter.publish([domain_event])
    console.log('Domain event emitted:', domain_event)

    return {
      statusCode: 201,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
        'Access-Control-Allow-Methods': 'POST,OPTIONS',
      },
      body: JSON.stringify(savedDataSource),
    }
    
  } catch (error) {
    console.error('Error creating data source:', error)
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
        'Access-Control-Allow-Methods': 'POST,OPTIONS',
      },
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
    }
  }
}

export const main = handler