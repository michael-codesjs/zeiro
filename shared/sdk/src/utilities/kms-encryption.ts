import { KMSClient, EncryptCommand, DecryptCommand } from '@aws-sdk/client-kms'

/**
 * AWS KMS-based encryption utilities security
 * 
 * Benefits of AWS KMS:
 * - FIPS 140-2 Level 2 validated HSMs
 * - Automatic key rotation
 * - Comprehensive audit logging (CloudTrail)
 * - Fine-grained access controls
 * - Envelope encryption pattern
 * - Regional availability and compliance
 */

const kmsClient = new KMSClient({ 
  region: process.env.AWS_REGION || 'eu-central-1'
})

interface KMSEncryptedData {
  version: 'kms-v1'
  keyId: string
  encryptionContext: Record<string, string>
  ciphertextBlob: string
  encryptedAt: string
}

/**
 * Direct KMS encryption (for small data < 4KB)
 * Best for: API keys, passwords, small secrets
 */
export async function encryptWithKMS(
  plaintext: string,
  keyId: string,
  additionalContext: Record<string, string> = {}
): Promise<string> {
  try {
    if (!keyId) {
      throw new Error('KMS Key ID is required')
    }
    
    if (Buffer.byteLength(plaintext, 'utf8') > 4096) {
      throw new Error('Data too large for direct KMS encryption. Use envelope encryption for data > 4KB.')
    }
    
    const encryptionContext = {
      service: 'zeiro',
      environment: process.env.NODE_ENV || 'development',
      ...additionalContext
    }
    
    const command = new EncryptCommand({
      KeyId: keyId,
      Plaintext: Buffer.from(plaintext, 'utf8'),
      EncryptionContext: encryptionContext
    })
    
    const result = await kmsClient.send(command)
    
    if (!result.CiphertextBlob) {
      throw new Error('KMS encryption failed: no ciphertext returned')
    }
    
    const encryptedData: KMSEncryptedData = {
      version: 'kms-v1',
      keyId: result.KeyId || keyId,
      encryptionContext,
      ciphertextBlob: Buffer.from(result.CiphertextBlob).toString('base64'),
      encryptedAt: new Date().toISOString()
    }
    
    return Buffer.from(JSON.stringify(encryptedData)).toString('base64')
    
  } catch (error) {
    console.error('KMS encryption failed:', error)
    throw new Error(`KMS encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Direct KMS decryption
 */
export async function decryptWithKMS(encryptedData: string): Promise<string> {
  try {
    let kmsData: KMSEncryptedData
    
    try {
      const jsonStr = Buffer.from(encryptedData, 'base64').toString('utf8')
      kmsData = JSON.parse(jsonStr)
    } catch {
      throw new Error('Invalid KMS encrypted data format')
    }
    
    if (kmsData.version !== 'kms-v1') {
      throw new Error(`Unsupported KMS encryption version: ${kmsData.version}`)
    }
    
    const command = new DecryptCommand({
      CiphertextBlob: Buffer.from(kmsData.ciphertextBlob, 'base64'),
      EncryptionContext: kmsData.encryptionContext
    })
    
    const result = await kmsClient.send(command)
    
    if (!result.Plaintext) {
      throw new Error('KMS decryption failed: no plaintext returned')
    }
    
    return Buffer.from(result.Plaintext).toString('utf8')
    
  } catch (error) {
    console.error('KMS decryption failed:', error)
    throw new Error(`KMS decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}