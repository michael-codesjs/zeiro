import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda'
import { credentials, decryptCredentialSecrets } from '@adapters/secondary/one-table'
import { withLambdaIOStandard } from '@zeiro/sdk'
import { Credential, AWSCredential, GCPCredential, AzureCredential, DatabaseCredential } from '@typings/credential'

const handler = async (
  event: APIGatewayProxyEvent,
  context: Context,
): Promise<APIGatewayProxyResult> => {
  console.log('event', JSON.stringify(event, null, 2))
  
  try {
    // For IAM authenticated requests, we need to get user_id from query parameters
    // since this is an internal service call
    const user_id = event.queryStringParameters?.user_id
    if (!user_id) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
          'Access-Control-Allow-Methods': 'GET,OPTIONS',
        },
        body: JSON.stringify({ error: 'user_id query parameter is required' }),
      }
    }

    // Get credential ID from path parameters
    const credential_id = event.pathParameters?.id
    if (!credential_id) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
          'Access-Control-Allow-Methods': 'GET,OPTIONS',
        },
        body: JSON.stringify({ error: 'Credential ID is required' }),
      }
    }

    // Get the credential - this will include all unmasked details
    const credential = (await credentials.get({
      user_id,
      id: credential_id,
    }))

    if (!credential) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
          'Access-Control-Allow-Methods': 'GET,OPTIONS',
        },
        body: JSON.stringify({ error: 'Credential not found' }),
      }
    }

    console.log('Credential found:', credential)
   
    if (credential.type === 'aws' && 'secret_access_key' in credential) {
      console.log('Secret access key format:', credential.secret_access_key.substring(0, 50) + '...')
      console.log('Secret access key parts count:', credential.secret_access_key.split(':').length)
    }

    // Check if credential has individual AWS fields or connection_details structure
    let decrypted_credential = credential
    
    // Only decrypt if there are encrypted fields present
    const has_encrypted_fields = (credential.type === 'aws' && 'secret_access_key' in credential) || 
                                (credential.type === 'gcp' && 'service_account_key' in credential) || 
                                (credential.type === 'azure' && 'client_secret' in credential) || 
                                (credential.type === 'database' && 'password' in credential)
    
    if (has_encrypted_fields) {
      console.log('Found encrypted fields, attempting decryption...')
      decrypted_credential = await decryptCredentialSecrets(credential)
      console.log('Decrypted credential:', JSON.stringify(decrypted_credential, null, 2))
    } else {
      console.log('No encrypted fields found, skipping decryption')
    }
    
    // Transform the credential to include connection_details for compatibility
    // with services that expect this structure (like get-dynamodb-databases)
    let transformed_credential: Credential & { connection_details?: Record<string, any> } = { ...decrypted_credential }
    
    // If credential already has connection_details, use it as-is
    if ('connection_details' in decrypted_credential) {
      console.log('Credential already has connection_details:', (decrypted_credential as any).connection_details)
    } else if (decrypted_credential.type === 'aws') {
      const awsCred = decrypted_credential as AWSCredential
      console.log('Processing AWS credential with fields:', {
        access_key_id: awsCred.access_key_id ? 'present' : 'missing',
        secret_access_key: awsCred.secret_access_key ? 'present' : 'missing',
        region: awsCred.region ? awsCred.region : 'missing'
      })
      
      // Only create connection_details if we have the individual fields
      if (awsCred.access_key_id || awsCred.secret_access_key) {
        transformed_credential.connection_details = {
          access_key_id: awsCred.access_key_id,
          secret_access_key: awsCred.secret_access_key,
          region: awsCred.region,
        }
      } else {
        console.log('No AWS fields found, connection_details will be empty')
        transformed_credential.connection_details = {}
      }
    } else if (decrypted_credential.type === 'gcp') {
      const gcpCred = decrypted_credential as GCPCredential
      transformed_credential.connection_details = {
        service_account_key: gcpCred.service_account_key,
        project_id: gcpCred.project_id,
      }
    } else if (decrypted_credential.type === 'azure') {
      const azureCred = decrypted_credential as AzureCredential
      transformed_credential.connection_details = {
        client_id: azureCred.client_id,
        client_secret: azureCred.client_secret,
        tenant_id: azureCred.tenant_id,
        subscription_id: azureCred.subscription_id,
      }
    } else if (decrypted_credential.type === 'database') {
      const dbCred = decrypted_credential as DatabaseCredential
      transformed_credential.connection_details = {
        host: dbCred.host,
        port: dbCred.port,
        database: dbCred.database,
        username: dbCred.username,
        password: dbCred.password,
        ssl: dbCred.ssl,
      }
    }

    console.log('Final transformed credential:', JSON.stringify(transformed_credential, null, 2))

    // Return the full credential with unmasked connection details
    // This is a secure endpoint that should only be called by internal services
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
        'Access-Control-Allow-Methods': 'GET,OPTIONS',
      },
      body: JSON.stringify(transformed_credential),
    }
    
  } catch (error) {
    console.error('Error fetching credential:', error)
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
        'Access-Control-Allow-Methods': 'GET,OPTIONS',
      },
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
    }
  }
}

export const main = handler 