import { credentials } from '@zeiro/domain'
import { decryptWithKMS } from './kms-encryption'

/**
 * Credential utility functions for common credential operations
 */

export interface DecryptedCredential {
  id: string
  user_id: string
  workspace_id: string
  name: string
  type: 'aws' | 'gcp' | 'azure' | 'database'
  status: 'active' | 'inactive' | 'expired'
  created_at: string
  updated_at: string
  last_used?: string
  
  // AWS specific fields (decrypted)
  account_id?: string
  access_key_id?: string
  secret_access_key?: string
  region?: string
  
  // GCP specific fields (decrypted)
  service_account_key?: string
  project_id?: string
  
  // Azure specific fields (decrypted)
  client_id?: string
  client_secret?: string
  tenant_id?: string
  subscription_id?: string
  
  // Database specific fields (decrypted)
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
    type?: 'aws' | 'gcp' | 'azure' | 'database'
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
          decrypted[field] = await decryptWithKMS(credential[field])
        }
        // If no metadata but field exists, assume it might be encrypted and try to decrypt
        else if (typeof credential[field] === 'string' && credential[field].length > 50) {
          try {
            decrypted[field] = await decryptWithKMS(credential[field])
          } catch {
            // If decryption fails, assume it's not encrypted
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
