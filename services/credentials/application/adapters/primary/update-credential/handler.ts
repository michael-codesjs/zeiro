import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda'
import { credentials, encryptCredentialSecrets } from '@adapters/secondary/one-table'
import { UpdateCredentialInput, Credential } from '@typings/credential'
import { CREDENTIAL_UPDATED_DOMAIN_EVENT } from '@typings/domain-events'
import { withLambdaIOStandard } from '@zeiro/sdk'
import { EventBridgeAdapter } from '@adapters/secondary/event-bridge'

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
          'Access-Control-Allow-Methods': 'PUT,OPTIONS',
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
          'Access-Control-Allow-Methods': 'PUT,OPTIONS',
        },
        body: JSON.stringify({ error: 'Credential ID is required' }),
      }
    }

    // Parse request body
    let updates: UpdateCredentialInput
    try {
      updates = JSON.parse(event.body || '{}')
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
          'Access-Control-Allow-Methods': 'PUT,OPTIONS',
        },
        body: JSON.stringify({ error: 'Credential not found or access denied' }),
      }
    }
    
    // Prepare update data with encryption for sensitive fields
    const update_data = {
      ...updates,
      updated_at: new Date().toISOString(),
    }
    
    // Encrypt sensitive fields if they're being updated
    const encrypted_updates = await encryptCredentialSecrets(update_data)
    
    // Update credential in database
    const updated_credential = await credentials.update({
      id,
      user_id,
      ...encrypted_updates,
    } as never)
    
    // Create and publish CREDENTIAL_UPDATED event
    const credential_updated_event: CREDENTIAL_UPDATED_DOMAIN_EVENT = {
      id: updated_credential.id,
      source: 'zeiro.domain.credentials.services.credential',
      name: 'CREDENTIAL_UPDATED',
      payload: updated_credential,
      date: new Date(),
    }
    
    await event_bridge_adapter.publish([credential_updated_event])
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
        'Access-Control-Allow-Methods': 'PUT,OPTIONS',
      },
      body: JSON.stringify(updated_credential),
    }
  } catch (error) {
    console.error('Error updating credential:', error)
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
        'Access-Control-Allow-Methods': 'PUT,OPTIONS',
      },
      body: JSON.stringify({ error: 'Failed to update credential' }),
    }
  }
}

/** 'updateCredential' lambda function handler wrapped in required middleware. */
export const main = handler