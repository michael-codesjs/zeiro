import { credentials, dataSources } from '@zeiro/domain'
import { decrypt } from './encryption'

/**
 * Credential utility functions for common credential operations
 */

export interface DecryptedCredential {
  id: string
  user_id: string
  workspace_id: string
  name: string
  type: 'iam_access_keys' | 'service_account_keys' | 'service_principals' | 'connection_details'
  status: 'active' | 'inactive' | 'expired'
  created_at: string
  updated_at: string
  last_used?: string
  
  // IAM Access Keys specific fields (decrypted)
  account_id?: string
  access_key_id?: string
  secret_access_key?: string
  region?: string
  
  // Service Account Keys specific fields (decrypted)
  service_account_key?: string
  project_id?: string
  
  // Service Principals specific fields (decrypted)
  client_id?: string
  client_secret?: string
  tenant_id?: string
  subscription_id?: string
  
  // Connection Details specific fields (decrypted)
  host?: string
  port?: number
  database?: string
  username?: string
  password?: string
  ssl?: boolean
  
  // Generic connection details
  connection_details?: any
}

/**
 * Get a credential by ID and decrypt its sensitive fields
 * @param credentialId - The credential ID
 * @returns Decrypted credential or null if not found
 */
export async function getDecryptedCredential(
  credentialId: string
): Promise<DecryptedCredential | null> {
  try {
    // Use the byId index for efficient lookup
    const result = await credentials.query.byId({ id: credentialId }).go()
    
    if (!result.data || result.data.length === 0) {
      return null
    }
    
    const credential = result.data[0]
    
    // Decrypt sensitive fields
    const decrypted = await decryptCredentialSecrets(credential)
    
    return decrypted as DecryptedCredential
    
  } catch (error) {
    console.error('Error fetching and decrypting credential:', error)
    throw error
  }
}

/**
 * Get multiple credentials by workspace and decrypt their sensitive fields
 * @param workspaceId - The workspace ID
 * @param options - Query options
 * @returns Array of decrypted credentials
 */
export async function getDecryptedCredentials(
  workspaceId: string,
  options: {
    type?: 'iam_access_keys' | 'service_account_keys' | 'service_principals' | 'connection_details'
    status?: 'active' | 'inactive' | 'expired'
  } = {}
): Promise<DecryptedCredential[]> {
  try {
    // Use the appropriate query based on filters
    let result
    
    if (options.type) {
      // Use byType index for type filtering
      result = await credentials.query.byType({
        workspace_id: workspaceId,
        type: options.type
      }).go()
    } else {
      // Use byWorkspace index for all credentials in workspace
      result = await credentials.query.byWorkspace({
        workspace_id: workspaceId
      }).go()
    }
    
    if (!result.data || result.data.length === 0) {
      return []
    }
    
    // Decrypt all credentials
    const decryptedCredentials = await Promise.all(
      result.data.map(async (credential) => {
        const decrypted = await decryptCredentialSecrets(credential)
        return decrypted as DecryptedCredential
      })
    )
    
    // Apply status filter after decryption if needed
    if (options.status) {
      return decryptedCredentials.filter(cred => cred.status === options.status)
    }
    
    return decryptedCredentials
    
  } catch (error) {
    console.error('Error fetching and decrypting credentials:', error)
    throw error
  }
}

/**
 * Decrypt sensitive fields in a credential object
 * @param credential - The credential with encrypted fields
 * @returns Credential with decrypted sensitive fields
 */
async function decryptCredentialSecrets(credential: any): Promise<any> {
  const decrypted = { ...credential }
  
  // Check if credential has KMS encryption metadata
  const metadata = credential._kmsEncryptionMetadata || {}
  
  const sensitiveFields = [
    'secret_access_key',
    'service_account_key',
    'client_secret',
    'password'
  ]
  
  for (const field of sensitiveFields) {
    if (credential[field]) {
      try {
        // If field has encryption metadata, decrypt it
        if (metadata[field]?.encrypted) {
          console.log(`Decrypting field ${field} with metadata:`, credential[field].substring(0, 100) + '...')
          decrypted[field] = await decrypt(credential[field])
        }
        // If no metadata but field exists, assume it might be encrypted and try to decrypt
        else if (typeof credential[field] === 'string' && credential[field].length > 50) {
          try {
            console.log(`Attempting to decrypt field ${field} (no metadata):`, credential[field].substring(0, 100) + '...')
            decrypted[field] = await decrypt(credential[field])
          } catch (error) {
            // If decryption fails, assume it's not encrypted
            console.log(`Field ${field} decryption failed, using as plaintext:`, error.message)
            decrypted[field] = credential[field]
          }
        }
      } catch (error) {
        console.error(`Failed to decrypt field ${field} for credential ${credential.id}:`, error)
        decrypted[field] = '***DECRYPTION_FAILED***'
      }
    }
  }
  
  // Remove encryption metadata from response
  delete decrypted._kmsEncryptionMetadata
  
  return decrypted
}

/**
 * Get a credential for a specific workspace (with workspace validation)
 * @param credentialId - The credential ID
 * @param workspaceId - The workspace ID (for validation)
 * @returns Decrypted credential or null if not found or not in same workspace
 */
export async function getWorkspaceDecryptedCredential(
  credentialId: string,
  workspaceId: string
): Promise<DecryptedCredential | null> {
  try {
    const credential = await getDecryptedCredential(credentialId)
    
    if (!credential) {
      return null
    }
    
    // Validate that the credential belongs to the same workspace
    if (credential.workspace_id !== workspaceId) {
      console.warn(`User from workspace ${workspaceId} attempted to access credential ${credentialId} from workspace ${credential.workspace_id}`)
      return null
    }
    
    return credential
    
  } catch (error) {
    console.error('Error fetching user credential:', error)
    throw error
  }
}

/**
 * Check if a credential exists and is accessible by a workspace
 * @param credentialId - The credential ID
 * @param workspaceId - The workspace ID
 * @returns Boolean indicating if credential exists and is accessible
 */
export async function isCredentialAccessible(
  credentialId: string,
  workspaceId: string
): Promise<boolean> {
  try {
    const credential = await getWorkspaceDecryptedCredential(credentialId, workspaceId)
    return credential !== null
  } catch (error) {
    console.error('Error checking credential accessibility:', error)
    return false
  }
}

/**
 * Data source with decrypted credential interface
 */
export interface DataSourceWithDecryptedCredential {
  id: string
  user_id: string
  workspace_id: string
  name: string
  description?: string
  type: 'DynamoDB' | 'PostgreSQL' | 'MySQL' | 'MongoDB' | 'Redis' | 'Cassandra' | 'InfluxDB' | 'Elasticsearch'
  credential_id: string
  connection_config: any
  entity_type: string
  creator_id: string
  creator_type: string
  discontinued: boolean
  created_at: string
  updated_at: string
  
  // Decrypted credential data
  credential: DecryptedCredential | null
}


/**
 * Get a data source by ID with decrypted credential (no user validation)
 * This is for trusted environments where user validation is handled elsewhere
 * @param dataSourceId - The data source ID
 * @returns Data source with decrypted credential or null if not found
 */
export async function getDataSourceWithCredentials(
  dataSourceId: string
): Promise<DataSourceWithDecryptedCredential | null> {
  try {
    console.log(`Attempting to fetch data source ${dataSourceId}`);
    
    // Use the byId index for efficient lookup
    const result = await dataSources.query.byId({
      id: dataSourceId
    }).go();
    
    console.log(`Query result:`, result);
    
    if (!result.data || result.data.length === 0) {
      console.warn(`Data source ${dataSourceId} not found`)
      return null
    }
    
    const dataSource = result.data[0]
    
    // Fetch and decrypt the credential
    let credential: DecryptedCredential | null = null
    
    if (dataSource.credential_id) {
      try {
        console.log('Attempting to decrypt credential:', dataSource.credential_id)
        credential = await getWorkspaceDecryptedCredential(
          dataSource.credential_id,
          dataSource.workspace_id
        )
        console.log('Successfully decrypted credential:', credential)
      } catch (error) {
        console.error(`Failed to decrypt credential for data source ${dataSourceId}:`, error)
        console.log('Continuing without decrypted credential - some operations might still work')
        // For development, we can continue without credential
        credential = null
      }
      
    }
    
    // Structure credential data for agent compatibility
    let structuredCredential = null;
    if (credential) {
      structuredCredential = {
        ...credential,
        secrets: {
          username: credential.username,
          password: credential.password,
          accessKeyId: credential.access_key_id,
          secretAccessKey: credential.secret_access_key,
          host: credential.host,
          port: credential.port,
          database: credential.database,
          ssl: credential.ssl,
          region: credential.region
        }
      };
    }
    
    return {
      ...dataSource,
      credential: structuredCredential
    } as DataSourceWithDecryptedCredential
  } catch (error) {
    console.error(`Error fetching data source ${dataSourceId}:`, error)
    throw error
  }
}

/**
 * Get a data source by workspace and ID with decrypted credential (no user validation)
 * This is for trusted environments where user validation is handled elsewhere
 * @param workspaceId - The workspace ID
 * @param dataSourceId - The data source ID
 * @returns Data source with decrypted credential or null if not found
 */
export async function getDataSourceWithDecryptedCredentialByWorkspace(
  workspaceId: string,
  dataSourceId: string
): Promise<DataSourceWithDecryptedCredential | null> {
  try {
    console.log(`Attempting to fetch data source ${dataSourceId} in workspace ${workspaceId} (no user validation)`);
    
    // Use the primary index (byWorkspace) for efficient lookup
    const result = await dataSources.get({
      workspace_id: workspaceId,
      id: dataSourceId
    }).go();
    
    console.log(`Query result:`, result);
    
    if (!result.data) {
      console.warn(`Data source ${dataSourceId} not found in workspace ${workspaceId}`)
      return null
    }
    
    const dataSource = result.data
    
    // Fetch and decrypt the credential
    let credential: DecryptedCredential | null = null
    
    if (dataSource.credential_id) {
      try {
        credential = await getWorkspaceDecryptedCredential(
          dataSource.credential_id,
          dataSource.workspace_id
        )
        
        if (!credential) {
          console.warn(`Credential ${dataSource.credential_id} not found or not accessible for workspace ${dataSource.workspace_id}`)
        }
      } catch (error) {
        console.error(`Failed to fetch credential ${dataSource.credential_id}:`, error)
        // Continue without credential - some data sources might not need credentials
      }
    }
    
    return {
      ...dataSource,
      credential
    } as DataSourceWithDecryptedCredential
    
  } catch (error) {
    console.error('Error fetching data source with decrypted credential:', error)
    throw error
  }
}

/**
 * Get a data source by user ID and data source ID with decrypted credential
 * (Alternative method with explicit user validation)
 * @param dataSourceId - The data source ID
 * @param userId - The user ID
 * @param workspaceId - The workspace ID (for additional validation)
 * @returns Data source with decrypted credential or null if not found
 */
export async function getUserDataSourceWithDecryptedCredential(
  dataSourceId: string,
  userId: string,
  workspaceId: string
): Promise<DataSourceWithDecryptedCredential | null> {
  try {
    // Fetch data source by ID using the byId index
    const result = await dataSources.query.byId({
      id: dataSourceId
    }).go();
    
    if (!result.data || result.data.length === 0) {
      console.warn(`Data source ${dataSourceId} not found`)
      return null
    }
    
    const dataSource = result.data[0]
    
    // Validate workspace access
    if (dataSource.workspace_id !== workspaceId) {
      console.warn(`User ${userId} from workspace ${workspaceId} attempted to access data source ${dataSourceId} from workspace ${dataSource.workspace_id}`)
      return null
    }
    
    // Validate user access (if user_id is stored on data source)
    if (dataSource.user_id !== userId) {
      console.warn(`User ${userId} attempted to access data source ${dataSourceId} owned by user ${dataSource.user_id}`)
      return null
    }
    
    // Fetch and decrypt the credential
    let credential: DecryptedCredential | null = null
    
    if (dataSource.credential_id) {
      try {
        credential = await getWorkspaceDecryptedCredential(
          dataSource.credential_id,
          dataSource.workspace_id
        )
        
        if (!credential) {
          console.warn(`Credential ${dataSource.credential_id} not found or not accessible for workspace ${dataSource.workspace_id}`)
        }
      } catch (error) {
        console.error(`Failed to fetch credential ${dataSource.credential_id}:`, error)
        // Continue without credential - some data sources might not need credentials
      }
    }
    
    return {
      ...dataSource,
      credential
    } as DataSourceWithDecryptedCredential
    
  } catch (error) {
    console.error('Error fetching user data source with decrypted credential:', error)
    throw error
  }
}
