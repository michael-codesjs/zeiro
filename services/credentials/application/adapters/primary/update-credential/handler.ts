import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda'
import { credentials } from '@zeiro/domain'
import { UpdateCredentialInput, Credential } from '@typings/credential'
import { CREDENTIAL_UPDATED_DOMAIN_EVENT } from '@typings/domain-events'
import { validateAuthenticatedUser } from '@zeiro/sdk'
import { EventBridgeAdapter } from '@adapters/secondary/event-bridge'
import { encryptCredentialSecrets } from '@adapters/secondary/kms-encryption'

// Initialize EventBridge adapter outside the handler for better performance
const event_bridge_adapter = new EventBridgeAdapter()

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
    
    // Verify credential exists and belongs to the user's workspace
    let existing_credential
    try {
      const result = await credentials.get({
        workspace_id: user.workspace_id,
        id: id
      }).go()
      existing_credential = result.data
    } catch (error) {
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
    
    // Verify that the credential belongs to the same workspace as the user
    if (existing_credential.workspace_id !== user.workspace_id) {
      return {
        statusCode: 403,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
          'Access-Control-Allow-Methods': 'PUT,OPTIONS',
        },
        body: JSON.stringify({ error: 'Access denied - credential belongs to different workspace' }),
      }
    }
    
    // Prepare update data with encryption for sensitive fields
    let update_data: any = {
      ...updates,
      updated_at: new Date().toISOString(),
    }
    
    // Flatten connection_details into individual fields for storage if provided
    if ('connection_details' in updates && updates.connection_details) {
      const { connection_details, ...rest } = update_data
      update_data = {
        ...rest,
        ...connection_details,
      }
    }
    
    // Encrypt sensitive fields if they're being updated
    const encrypted_updates = await encryptCredentialSecrets(update_data)
    
    // Update credential in database using domain entity
    const updated_credential = await credentials.patch({
      workspace_id: existing_credential.workspace_id,
      id: id
    }).set(encrypted_updates).go()
    
    // Create and publish CREDENTIAL_UPDATED event
    const credential_updated_event: CREDENTIAL_UPDATED_DOMAIN_EVENT = {
      id: updated_credential.data.id,
      source: 'zeiro.domain.credentials.services.credential',
      name: 'CREDENTIAL_UPDATED',
      payload: updated_credential.data as Credential,
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
      body: JSON.stringify(updated_credential.data as Credential),
    }
  } catch (error) {
    console.error('Error updating credential:', error)
    
    // Handle authentication errors
    if (error instanceof Error) {
      if (error.message === 'User not authenticated') {
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
      
      if (error.message === 'User not found') {
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
    }
    
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