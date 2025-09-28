import { createCipheriv, createDecipheriv, randomBytes, scrypt, timingSafeEqual } from 'crypto'
import { promisify } from 'util'

const scryptAsync = promisify(scrypt)

/**
 * Implements industry best practices for financial-grade security
 */

// Enhanced configuration
const ALGORITHM = 'aes-256-gcm'
const KEY_LENGTH = 32 // 256 bits
const IV_LENGTH = 16  // 128 bits for GCM
const SALT_LENGTH = 32 // 256 bits for stronger key derivation
const TAG_LENGTH = 16 // 128 bits authentication tag

// OWASP recommended scrypt parameters (2024)
const SCRYPT_PARAMS = {
  N: 32768,  // CPU/memory cost parameter (2^15)
  r: 8,      // Block size parameter
  p: 1,      // Parallelization parameter
}

// Key versioning for rotation support
const CURRENT_KEY_VERSION = 'v1'

interface EncryptionConfig {
  keyId: string
  version: string
  algorithm: string
  keyDerivation: {
    function: string
    params: typeof SCRYPT_PARAMS
  }
}

interface EncryptedData {
  version: string
  keyId: string
  salt: string
  iv: string
  authTag: string
  ciphertext: string
  config: EncryptionConfig
}

/**
 * Get encryption key with versioning support
 */
function getEncryptionKey(version: string = CURRENT_KEY_VERSION): string {
  const keyEnvVar = `CREDENTIAL_ENCRYPTION_KEY_${version.toUpperCase()}`
  const key = process.env[keyEnvVar] || process.env.CREDENTIAL_ENCRYPTION_KEY
  
  if (!key || key === 'default-key-change-in-production') {
    throw new Error(`Encryption key not configured for version ${version}. Set ${keyEnvVar} environment variable.`)
  }
  
  return key
}

/**
 * Enhanced key derivation with OWASP-recommended parameters
 */
async function deriveKey(
  password: string, 
  salt: Buffer, 
  params: typeof SCRYPT_PARAMS = SCRYPT_PARAMS
): Promise<Buffer> {
  try {
    // Node.js scrypt with options requires different approach
    return new Promise<Buffer>((resolve, reject) => {
      scrypt(password, salt, KEY_LENGTH, params, (err, derivedKey) => {
        if (err) reject(err)
        else resolve(derivedKey as Buffer)
      })
    })
  } catch (error) {
    console.error('Key derivation failed:', error)
    throw new Error('Failed to derive encryption key')
  }
}

/**
 * Validate input parameters for security
 */
function validateInput(text: string): void {
  if (!text || typeof text !== 'string') {
    throw new Error('Invalid input: text must be a non-empty string')
  }
  
  if (text.length > 1024 * 1024) { // 1MB limit
    throw new Error('Input too large: maximum 1MB allowed')
  }
}

/**
 * Enhanced encrypt function with bank-level security
 */
export async function encryptEnhanced(
  text: string, 
  keyVersion: string = CURRENT_KEY_VERSION
): Promise<string> {
  try {
    validateInput(text)
    
    // Generate cryptographically secure random values
    const salt = randomBytes(SALT_LENGTH)
    const iv = randomBytes(IV_LENGTH)
    
    // Get versioned encryption key
    const masterKey = getEncryptionKey(keyVersion)
    
    // Derive encryption key with enhanced parameters
    const derivedKey = await deriveKey(masterKey, salt, SCRYPT_PARAMS)
    
    // Create cipher with AES-256-GCM
    const cipher = createCipheriv(ALGORITHM, derivedKey, iv)
    
    // Encrypt the data
    let ciphertext = cipher.update(text, 'utf8', 'hex')
    ciphertext += cipher.final('hex')
    
    // Get authentication tag
    const authTag = cipher.getAuthTag()
    
    // Create metadata for versioning and configuration
    const config: EncryptionConfig = {
      keyId: keyVersion,
      version: CURRENT_KEY_VERSION,
      algorithm: ALGORITHM,
      keyDerivation: {
        function: 'scrypt',
        params: SCRYPT_PARAMS
      }
    }
    
    // Create structured encrypted data
    const encryptedData: EncryptedData = {
      version: CURRENT_KEY_VERSION,
      keyId: keyVersion,
      salt: salt.toString('hex'),
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
      ciphertext,
      config
    }
    
    // Return as base64-encoded JSON for better structure
    return Buffer.from(JSON.stringify(encryptedData)).toString('base64')
    
  } catch (error) {
    console.error('Enhanced encryption failed:', error)
    throw new Error('Failed to encrypt data')
  }
}

/**
 * Enhanced decrypt function with version support
 */
export async function decryptEnhanced(encryptedText: string): Promise<string> {
  try {
    let encryptedData: EncryptedData
    
    // Try to parse as new enhanced format
    try {
      const jsonStr = Buffer.from(encryptedText, 'base64').toString('utf8')
      encryptedData = JSON.parse(jsonStr)
    } catch {
      // Fallback to legacy format
      return await decryptLegacy(encryptedText)
    }
    
    // Validate encrypted data structure
    if (!encryptedData.version || !encryptedData.keyId || !encryptedData.salt) {
      throw new Error('Invalid encrypted data format')
    }
    
    // Get the appropriate key for this version
    const masterKey = getEncryptionKey(encryptedData.keyId)
    
    // Parse components
    const salt = Buffer.from(encryptedData.salt, 'hex')
    const iv = Buffer.from(encryptedData.iv, 'hex')
    const authTag = Buffer.from(encryptedData.authTag, 'hex')
    
    // Derive key with stored parameters
    const params = encryptedData.config?.keyDerivation?.params || SCRYPT_PARAMS
    const derivedKey = await deriveKey(masterKey, salt, params)
    
    // Create decipher
    const decipher = createDecipheriv(ALGORITHM, derivedKey, iv)
    decipher.setAuthTag(authTag)
    
    // Decrypt
    let decrypted = decipher.update(encryptedData.ciphertext, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    
    return decrypted
    
  } catch (error) {
    console.error('Enhanced decryption failed:', error)
    throw new Error('Failed to decrypt data')
  }
}

/**
 * Legacy decryption for backward compatibility
 */
async function decryptLegacy(encryptedText: string): Promise<string> {
  // Implementation for backward compatibility with old format
  // This would include the existing decrypt logic
  throw new Error('Legacy decryption not yet implemented - use migration tool')
}

/**
 * Secure credential field encryption with field-level metadata
 */
export async function encryptCredentialSecretsEnhanced(credential: any): Promise<any> {
  const encrypted = { ...credential }
  const encryptionMetadata: Record<string, any> = {}
  
  // Define sensitive fields with their encryption requirements
  const sensitiveFields = [
    'secret_access_key',
    'service_account_key', 
    'client_secret',
    'password'
  ]
  
  for (const field of sensitiveFields) {
    if (credential[field]) {
      try {
        encrypted[field] = await encryptEnhanced(credential[field])
        encryptionMetadata[field] = {
          encrypted: true,
          algorithm: ALGORITHM,
          version: CURRENT_KEY_VERSION,
          encryptedAt: new Date().toISOString()
        }
      } catch (error) {
        console.error(`Failed to encrypt field ${field}:`, error)
        throw new Error(`Encryption failed for sensitive field: ${field}`)
      }
    }
  }
  
  // Store encryption metadata (not sensitive)
  encrypted._encryptionMetadata = encryptionMetadata
  
  return encrypted
}

/**
 * Secure credential field decryption
 */
export async function decryptCredentialSecretsEnhanced(credential: any): Promise<any> {
  const decrypted = { ...credential }
  const metadata = credential._encryptionMetadata || {}
  
  const sensitiveFields = [
    'secret_access_key',
    'service_account_key',
    'client_secret', 
    'password'
  ]
  
  for (const field of sensitiveFields) {
    if (credential[field] && metadata[field]?.encrypted) {
      try {
        decrypted[field] = await decryptEnhanced(credential[field])
      } catch (error) {
        console.error(`Failed to decrypt field ${field}:`, error)
        decrypted[field] = '***DECRYPTION_FAILED***'
      }
    }
  }
  
  // Remove metadata from response
  delete decrypted._encryptionMetadata
  
  return decrypted
}

/**
 * Key rotation utility
 */
export async function rotateCredentialEncryption(
  credential: any, 
  newKeyVersion: string = CURRENT_KEY_VERSION
): Promise<any> {
  // First decrypt with old key
  const decrypted = await decryptCredentialSecretsEnhanced(credential)
  
  // Re-encrypt with new key
  const reencrypted = await encryptCredentialSecretsEnhanced(decrypted)
  
  return {
    ...reencrypted,
    _rotationMetadata: {
      rotatedAt: new Date().toISOString(),
      newKeyVersion,
      previousVersion: credential._encryptionMetadata?.version || 'unknown'
    }
  }
}

/**
 * Security audit utility
 */
export function auditEncryptionSecurity(credential: any): {
  isSecure: boolean
  issues: string[]
  recommendations: string[]
} {
  const issues: string[] = []
  const recommendations: string[] = []
  
  const metadata = credential._encryptionMetadata || {}
  
  // Check if sensitive fields are encrypted
  const sensitiveFields = ['secret_access_key', 'service_account_key', 'client_secret', 'password']
  for (const field of sensitiveFields) {
    if (credential[field] && !metadata[field]?.encrypted) {
      issues.push(`Sensitive field '${field}' is not encrypted`)
      recommendations.push(`Encrypt field '${field}' using encryptCredentialSecretsEnhanced()`)
    }
  }
  
  // Check encryption age
  for (const field of sensitiveFields) {
    if (metadata[field]?.encryptedAt) {
      const encryptedDate = new Date(metadata[field].encryptedAt)
      const daysSinceEncryption = (Date.now() - encryptedDate.getTime()) / (1000 * 60 * 60 * 24)
      
      if (daysSinceEncryption > 365) { // 1 year
        issues.push(`Field '${field}' encryption is over 1 year old`)
        recommendations.push(`Consider rotating encryption for field '${field}'`)
      }
    }
  }
  
  return {
    isSecure: issues.length === 0,
    issues,
    recommendations
  }
}
