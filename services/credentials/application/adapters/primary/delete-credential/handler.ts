import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda'
import { credentials } from '@zeiro/domain'
import { CREDENTIAL_DELETED_DOMAIN_EVENT } from '@typings/domain-events'
import { validateAuthenticatedUser } from '@zeiro/sdk'
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
    // Validate authenticated user using SDK utility
    const cognito_user_id = event.requestContext?.authorizer?.claims?.sub
    const user = await validateAuthenticatedUser(cognito_user_id)

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
    
    // Try to delete credential directly - if it doesn't exist or doesn't belong to workspace, it will fail
    let deleted_credential
    try {
      deleted_credential = await credentials.delete({
        workspace_id: user.workspace_id,
        id: id
      }).go()
    } catch (error) {
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
    
    // Create and publish CREDENTIAL_DELETED event
    const credential_deleted_event: CREDENTIAL_DELETED_DOMAIN_EVENT = {
      id: deleted_credential.data.id,
      source: 'zeiro.domain.credentials.services.credential',
      name: 'CREDENTIAL_DELETED',
      payload: {
        id: deleted_credential.data.id,
        user_id: deleted_credential.data.user_id,
        name: deleted_credential.data.name,
        type: deleted_credential.data.type,
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
    
    // Handle authentication errors
    if (error instanceof Error) {
      if (error.message === 'User not authenticated') {
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
      
      if (error.message === 'User not found') {
        return {
          statusCode: 404,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
            'Access-Control-Allow-Methods': 'DELETE,OPTIONS',
          },
          body: JSON.stringify({ error: 'User not found' }),
        }
      }
    }
    
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