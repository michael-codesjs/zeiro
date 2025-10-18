import { KMSClient, EncryptCommand, DecryptCommand } from '@aws-sdk/client-kms'

/**
 * KMS-based encryption utilities for sensitive data
 * All encryption now uses AWS KMS for enhanced security
 */

const kmsClient = new KMSClient({ 
  region: process.env.AWS_REGION || 'eu-central-1'
})

/**
 * Encrypt text using KMS (simple, no encryption context)
 * @param text - The text to encrypt
 * @param keyId - The KMS key ID or alias to use for encryption
 * @returns Encrypted string (base64-encoded ciphertext blob)
 */
export async function encrypt(text: string, keyId: string): Promise<string> {
  try {
    if (!keyId) {
      throw new Error('KMS Key ID is required')
    }
    
    if (Buffer.byteLength(text, 'utf8') > 4096) {
      throw new Error('Data too large for direct KMS encryption. Use envelope encryption for data > 4KB.')
    }
    
    const command = new EncryptCommand({
      KeyId: keyId,
      Plaintext: Buffer.from(text, 'utf8')
    })
    
    const result = await kmsClient.send(command)
    
    if (!result.CiphertextBlob) {
      throw new Error('KMS encryption failed: no ciphertext returned')
    }
    
    // Return just the base64-encoded ciphertext blob
    return Buffer.from(result.CiphertextBlob).toString('base64')
    
  } catch (error) {
    console.error('KMS encryption failed:', error)
    throw new Error(`KMS encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Decrypt text using KMS with proper error handling
 * @param encryptedText - The encrypted text to decrypt (base64-encoded ciphertext blob)
 * @returns Decrypted string
 */
export async function decrypt(encryptedText: string): Promise<string> {
  try {
    // Check if the data looks like KMS-encrypted data (base64)
    if (!encryptedText) {
      throw new Error('No encrypted text provided')
    }
    
    // If it doesn't look like base64, it's probably not KMS-encrypted
    if (!/^[A-Za-z0-9+/]+=*$/.test(encryptedText)) {
      console.warn('Data does not appear to be KMS-encrypted (not base64), treating as plaintext')
      return encryptedText
    }
    
    // If it's too short to be KMS data, treat as plaintext
    if (encryptedText.length < 100) {
      console.warn('Data too short to be KMS-encrypted, treating as plaintext')
      return encryptedText
    }
    
    const command = new DecryptCommand({
      CiphertextBlob: Buffer.from(encryptedText, 'base64')
    })
    
    const result = await kmsClient.send(command)
    
    if (!result.Plaintext) {
      throw new Error('KMS decryption failed: no plaintext returned')
    }
    
    return Buffer.from(result.Plaintext).toString('utf8')
    
  } catch (error) {
    console.error('KMS decryption failed for data:', encryptedText.substring(0, 50) + '...', error)
    
    // If it's an InvalidCiphertextException, the data is probably not KMS-encrypted
    if (error.name === 'InvalidCiphertextException') {
      console.warn('InvalidCiphertextException - data is not KMS-encrypted, returning as plaintext')
      return encryptedText
    }
    
    throw new Error(`KMS decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Encrypt sensitive fields in credential data using KMS
 * @param credential - The credential object with potentially sensitive fields
 * @param keyId - The KMS key ID or alias to use for encryption
 * @returns Credential object with encrypted sensitive fields and metadata
 */
export async function encryptCredentialSecrets(credential: any, keyId: string): Promise<any> {
  const encrypted = { ...credential }

  if (!keyId) {
    throw new Error('KMS Key ID is required for credential encryption')
  }

  const sensitiveFields = [
    'secret_access_key',
    'service_account_key',
    'client_secret',
    'password'
  ]

  for (const field of sensitiveFields) {
    if (credential[field]) {
      try {
        encrypted[field] = await encrypt(credential[field], keyId)
      } catch (error) {
        console.error(`Failed to encrypt field ${field} with KMS:`, error)
        throw new Error(`KMS encryption failed for sensitive field: ${field}`)
      }
    }
  }

  return encrypted
}

/**
 * Decrypt sensitive fields in credential data
 * @param credential - The credential object with encrypted sensitive fields
 * @returns Credential object with decrypted sensitive fields
 */
export async function decryptCredentialSecrets(credential: any): Promise<any> {
  const decrypted = { ...credential }
  
  // Decrypt sensitive fields based on credential type, with error handling
  if (credential.secret_access_key) {
    try {
      decrypted.secret_access_key = await decrypt(credential.secret_access_key)
    } catch (error) {
      console.error('Failed to decrypt secret_access_key for credential:', credential.id, error)
      decrypted.secret_access_key = '***DECRYPTION_FAILED***'
    }
  }
  
  if (credential.service_account_key) {
    try {
      decrypted.service_account_key = await decrypt(credential.service_account_key)
    } catch (error) {
      console.error('Failed to decrypt service_account_key for credential:', credential.id, error)
      decrypted.service_account_key = '***DECRYPTION_FAILED***'
    }
  }
  
  if (credential.client_secret) {
    try {
      decrypted.client_secret = await decrypt(credential.client_secret)
    } catch (error) {
      console.error('Failed to decrypt client_secret for credential:', credential.id, error)
      decrypted.client_secret = '***DECRYPTION_FAILED***'
    }
  }
  
  if (credential.password) {
    try {
      decrypted.password = await decrypt(credential.password)
    } catch (error) {
      console.error('Failed to decrypt password for credential:', credential.id, error)
      decrypted.password = '***DECRYPTION_FAILED***'
    }
  }
  
  return decrypted
}
