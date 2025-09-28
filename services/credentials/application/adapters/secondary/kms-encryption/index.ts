import { encryptWithKMS as sdkEncryptWithKMS, decryptWithKMS as sdkDecryptWithKMS } from '@zeiro/sdk'

/**
 * Credentials service KMS encryption facade
 * Uses the credentials-specific KMS key
 */

const KMS_KEY_ALIAS = process.env.CREDENTIAL_KMS_KEY_ALIAS || `alias/zeiro-credentials-${process.env.STAGE || 'dev'}`

/**
 * Encrypt text using credentials KMS key
 */
export async function encrypt(
  plaintext: string,
  context: Record<string, string> = {}
): Promise<string> {
  if (!KMS_KEY_ALIAS) {
    throw new Error('KMS Key Alias not configured. Set CREDENTIAL_KMS_KEY_ALIAS environment variable.')
  }

  const credentialsContext = {
    service: 'zeiro-credentials',
    ...context
  }

  return sdkEncryptWithKMS(plaintext, KMS_KEY_ALIAS, credentialsContext)
}

/**
 * Decrypt text using KMS
 */
export async function decrypt(encryptedData: string): Promise<string> {
  return sdkDecryptWithKMS(encryptedData)
}

/**
 * Encrypt credential secrets using KMS
 */
export async function encryptCredentialSecrets(credential: any): Promise<any> {
  return encryptCredentialSecretsKMS(credential)
}

/**
 * Decrypt credential secrets using KMS
 */
export async function decryptCredentialSecrets(credential: any): Promise<any> {
  return decryptCredentialSecretsKMS(credential)
}

/**
 * KMS-based credential encryption
 */
async function encryptCredentialSecretsKMS(credential: any): Promise<any> {
  const encrypted = { ...credential }
  const encryptionMetadata: Record<string, any> = {}

  const sensitiveFields = [
    'secret_access_key',
    'service_account_key',
    'client_secret',
    'password'
  ]

  for (const field of sensitiveFields) {
    if (credential[field]) {
      try {
        const fieldContext = {
          field,
          credentialType: credential.type,
          credentialId: credential.id,
          userId: credential.user_id,
          workspaceId: credential.workspace_id
        }

        encrypted[field] = await encrypt(credential[field], fieldContext)

        encryptionMetadata[field] = {
          encrypted: true,
          method: 'kms',
          algorithm: 'aes-256-gcm',
          keyId: KMS_KEY_ALIAS,
          encryptedAt: new Date().toISOString(),
          context: fieldContext
        }
      } catch (error) {
        console.error(`Failed to encrypt field ${field} with KMS:`, error)
        throw new Error(`KMS encryption failed for sensitive field: ${field}`)
      }
    }
  }

  encrypted._kmsEncryptionMetadata = encryptionMetadata

  return encrypted
}

/**
 * KMS-based credential decryption
 */
async function decryptCredentialSecretsKMS(credential: any): Promise<any> {
  const decrypted = { ...credential }
  const metadata = credential._kmsEncryptionMetadata || {}

  const sensitiveFields = [
    'secret_access_key',
    'service_account_key',
    'client_secret',
    'password'
  ]

  for (const field of sensitiveFields) {
    if (credential[field] && metadata[field]?.encrypted) {
      try {
        decrypted[field] = await decrypt(credential[field])
      } catch (error) {
        console.error(`Failed to decrypt field ${field} with KMS:`, error)
        decrypted[field] = '***KMS_DECRYPTION_FAILED***'
      }
    }
  }

  // Remove metadata from response
  delete decrypted._kmsEncryptionMetadata

  return decrypted
}
