import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda'
import { credentials } from '@adapters/secondary/one-table'
import { CREDENTIAL_DELETED_DOMAIN_EVENT } from '@typings/domain-events'
import { withLambdaIOStandard } from '@zeiro/sdk'
import { EventBridgeAdapter } from '@adapters/secondary/event-bridge'

// Initialize EventBridge adapter outside the handler for better performance
const event_bridge_adapter = new EventBridgeAdapter()

interface DeleteCredentialResponse {
  success: boolean
  message: string
}

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

    // Extract credential ID from path parameters
    const id = event.pathParameters?.id
    if (!id) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
          'Access-Control-Allow-Methods': 'DELETE,OPTIONS',
        },
        body: JSON.stringify({ error: 'Credential ID is required' }),
      }
    }
    
    // First, get the existing credential to ensure it belongs to the user
    const existing_credential = await credentials.get({
      id,
      user_id,
    } as never)
    
    if (!existing_credential) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
          'Access-Control-Allow-Methods': 'DELETE,OPTIONS',
        },
        body: JSON.stringify({ error: 'Credential not found or access denied' }),
      }
    }
    
    // Delete credential from database
    await credentials.remove({
      id,
      user_id,
    } as never)
    
    // Create and publish CREDENTIAL_DELETED event
    const credential_deleted_event: CREDENTIAL_DELETED_DOMAIN_EVENT = {
      id: existing_credential.id,
      source: 'zeiro.domain.credentials.services.credential',
      name: 'CREDENTIAL_DELETED',
      payload: {
        id: existing_credential.id,
        user_id: existing_credential.user_id,
        name: existing_credential.name,
        type: existing_credential.type,
      },
      date: new Date(),
    }
    
    await event_bridge_adapter.publish([credential_deleted_event])
    
    const response: DeleteCredentialResponse = {
      success: true,
      message: 'Credential deleted successfully',
    }
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
        'Access-Control-Allow-Methods': 'DELETE,OPTIONS',
      },
      body: JSON.stringify(response),
    }
  } catch (error) {
    console.error('Error deleting credential:', error)
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
        'Access-Control-Allow-Methods': 'DELETE,OPTIONS',
      },
      body: JSON.stringify({ error: 'Failed to delete credential' }),
    }
  }
}

/** 'deleteCredential' lambda function handler wrapped in required middleware. */
export const main = handler