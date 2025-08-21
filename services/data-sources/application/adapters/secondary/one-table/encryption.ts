import { createCipheriv, createDecipheriv, randomBytes, scrypt, createDecipher } from 'crypto'
import { promisify } from 'util'

const scryptAsync = promisify(scrypt)
const ALGORITHM = 'aes-256-gcm'
const ENCRYPTION_KEY = process.env.CREDENTIAL_ENCRYPTION_KEY || 'default-key-change-in-production'

// Derive a key from the password using scrypt
async function deriveKey(password: string, salt: Buffer): Promise<Buffer> {
  return (await scryptAsync(password, salt, 32)) as Buffer
}

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

export async function decrypt(encryptedText: string): Promise<string> {
  try {
    // First try new GCM format
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
          console.warn('GCM decryption failed, trying legacy formats:', gcmError)
          // Fall through to legacy decryption
        }
      }
    }
    
    // Try legacy decryption methods
    return await legacyDecrypt(encryptedText)
  } catch (error) {
    console.error('Decryption error:', error)
    // Return masked value instead of throwing to prevent complete failure
    return '***DECRYPTION_FAILED***'
  }
}

// Legacy decryption for backward compatibility
async function legacyDecrypt(encryptedText: string): Promise<string> {
  try {
    // Try the old deprecated CBC format
    const decipher = createDecipher('aes-256-cbc', ENCRYPTION_KEY)
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    return decrypted
  } catch (error) {
    console.error('Legacy decryption error:', error)
    // If all decryption methods fail, check if it's already plain text
    if (encryptedText && !encryptedText.match(/^[a-f0-9:]+$/i)) {
      console.warn('Data appears to be unencrypted, returning as-is')
      return encryptedText
    }
    throw error
  }
}

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