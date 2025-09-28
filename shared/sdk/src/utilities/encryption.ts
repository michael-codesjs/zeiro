import { createCipheriv, createDecipheriv, randomBytes, scrypt, createDecipher } from 'crypto'
import { promisify } from 'util'

const scryptAsync = promisify(scrypt)
const ALGORITHM = 'aes-256-gcm'
const ENCRYPTION_KEY = process.env.CREDENTIAL_ENCRYPTION_KEY || 'default-key-change-in-production'

/**
 * Encryption utilities for sensitive data
 */

// Derive a key from the password using scrypt
async function deriveKey(password: string, salt: Buffer): Promise<Buffer> {
  return (await scryptAsync(password, salt, 32)) as Buffer
}

/**
 * Encrypt text using AES-256-GCM
 * @param text - The text to encrypt
 * @returns Encrypted string in format: salt:iv:authTag:encrypted
 */
export async function encrypt(text: string): Promise<string> {
  try {
    const iv = randomBytes(16)
    const salt = randomBytes(16)
    const key = await deriveKey(ENCRYPTION_KEY, salt)
    
    const cipher = createCipheriv(ALGORITHM, key, iv)
    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    
    const authTag = cipher.getAuthTag()
    
    // Combine salt, iv, authTag, and encrypted data
    return salt.toString('hex') + ':' + iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted
  } catch (error) {
    console.error('Encryption error:', error)
    throw new Error('Failed to encrypt data')
  }
}

/**
 * Decrypt text using AES-256-GCM with backward compatibility
 * @param encryptedText - The encrypted text to decrypt
 * @returns Decrypted string
 */
export async function decrypt(encryptedText: string): Promise<string> {
  try {
    // First try new GCM format with current key
    if (encryptedText.includes(':')) {
      const parts = encryptedText.split(':')
      if (parts.length === 4) {
        try {
          const [saltHex, ivHex, authTagHex, encrypted] = parts
          const salt = Buffer.from(saltHex, 'hex')
          const iv = Buffer.from(ivHex, 'hex')
          const authTag = Buffer.from(authTagHex, 'hex')
          
          const key = await deriveKey(ENCRYPTION_KEY, salt)
          
          const decipher = createDecipheriv(ALGORITHM, key, iv)
          decipher.setAuthTag(authTag)
          
          let decrypted = decipher.update(encrypted, 'hex', 'utf8')
          decrypted += decipher.final('utf8')
          
          return decrypted
        } catch (gcmError) {
          console.warn('GCM decryption failed with current key, trying default key:', gcmError)
          
          // Try with default key for backward compatibility
          try {
            const [saltHex, ivHex, authTagHex, encrypted] = parts
            const salt = Buffer.from(saltHex, 'hex')
            const iv = Buffer.from(ivHex, 'hex')
            const authTag = Buffer.from(authTagHex, 'hex')
            
            const defaultKey = await deriveKey('default-key-change-in-production', salt)
            
            const decipher = createDecipheriv(ALGORITHM, defaultKey, iv)
            decipher.setAuthTag(authTag)
            
            let decrypted = decipher.update(encrypted, 'hex', 'utf8')
            decrypted += decipher.final('utf8')
            
            console.log('Successfully decrypted with default key - credential needs re-encryption')
            return decrypted
          } catch (defaultKeyError) {
            console.warn('GCM decryption failed with default key, trying legacy formats:', defaultKeyError)
            // Fall through to legacy decryption
          }
        }
      }
    }
    
    // Try legacy decryption methods
    return await legacyDecrypt(encryptedText)
  } catch (error) {
    console.error('Decryption error:', error)
    throw new Error('Failed to decrypt data')
  }
}

/**
 * Legacy decryption for backward compatibility
 * @param encryptedText - The encrypted text to decrypt using legacy methods
 * @returns Decrypted string
 */
async function legacyDecrypt(encryptedText: string): Promise<string> {
  try {
    // If it doesn't look encrypted, return as-is (for development/testing)
    if (!encryptedText || encryptedText.length < 32) {
      console.warn('Text appears to be unencrypted, returning as-is')
      return encryptedText
    }
    throw new Error('Unable to decrypt using any known method')
  } catch (error) {
    console.error('Legacy decryption failed:', error)
    if (typeof encryptedText === 'string') {
      console.warn('Returning encrypted text as-is due to decryption failure')
      return encryptedText
    }
    throw error
  }
}

/**
 * Encrypt sensitive fields in credential data
 * @param credential - The credential object with potentially sensitive fields
 * @returns Credential object with encrypted sensitive fields
 */
export async function encryptCredentialSecrets(credential: any): Promise<any> {
  const encrypted = { ...credential }
  
  // Encrypt sensitive fields based on credential type
  if (credential.secret_access_key) {
    encrypted.secret_access_key = await encrypt(credential.secret_access_key)
  }
  
  if (credential.service_account_key) {
    encrypted.service_account_key = await encrypt(credential.service_account_key)
  }
  
  if (credential.client_secret) {
    encrypted.client_secret = await encrypt(credential.client_secret)
  }
  
  if (credential.password) {
    encrypted.password = await encrypt(credential.password)
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
