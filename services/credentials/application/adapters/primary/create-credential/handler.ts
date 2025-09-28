import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda'
import { credentials } from '@zeiro/domain'
import { CreateCredentialInput, Credential } from '@typings/credential'
import { CREDENTIAL_CREATED_DOMAIN_EVENT } from '@typings/domain-events'
import { validateAuthenticatedUser } from '@zeiro/sdk'
import { EventBridgeAdapter } from '@adapters/secondary/event-bridge'
import { encryptCredentialSecrets } from '@adapters/secondary/kms-encryption'
import { v4 as uuidv4 } from 'uuid'

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

    // Parse request body
    let input: CreateCredentialInput
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

    // Generate unique ID
    const id = uuidv4()
    
    // Prepare credential data
    let credential_data: any = {
      ...input,
      id,
      user_id: user.id,
      workspace_id: user.workspace_id,
    }
    
    // Flatten connection_details into individual fields for storage
    if ('connection_details' in input && input.connection_details) {
      // Remove the connection_details object and spread its contents
      const { connection_details, ...rest } = credential_data
      credential_data = {
        ...rest,
        ...connection_details,
      }
    }
    
    console.log('Credential data before encryption:', JSON.stringify(credential_data, null, 2))
    
    // Encrypt sensitive fields before storing
    const encrypted_credential = await encryptCredentialSecrets(credential_data)
    
    // Create credential in database using domain entity
    const credential = await credentials.create(encrypted_credential).go()
    
    // Create and publish CREDENTIAL_CREATED event
    const credential_created_event: CREDENTIAL_CREATED_DOMAIN_EVENT = {
      id: credential.data.id,
      source: 'zeiro.domain.credentials.services.credential',
      name: 'CREDENTIAL_CREATED',
      payload: credential.data as Credential,
      date: new Date(),
    }
    
    await event_bridge_adapter.publish([credential_created_event])
    
    return {
      statusCode: 201,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
        'Access-Control-Allow-Methods': 'POST,OPTIONS',
      },
      body: JSON.stringify(credential.data as Credential),
    }
  } catch (error) {
    console.error('Error creating credential:', error)
    
    // Handle authentication errors
    if (error instanceof Error) {
      if (error.message === 'User not authenticated') {
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
      
      if (error.message === 'User not found') {
        return {
          statusCode: 404,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
            'Access-Control-Allow-Methods': 'POST,OPTIONS',
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
        'Access-Control-Allow-Methods': 'POST,OPTIONS',
      },
      body: JSON.stringify({ error: 'Failed to create credential' }),
    }
  }
}

/** 'createCredential' lambda function handler wrapped in required middleware. */
export const main = handler