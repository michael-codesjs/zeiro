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

/**
 * Simple KMS encryption (for small data < 4KB)
 * Returns base64-encoded ciphertext blob
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
    
    // Return just the base64-encoded ciphertext blob
    return Buffer.from(result.CiphertextBlob).toString('base64')
    
  } catch (error) {
    console.error('KMS encryption failed:', error)
    throw new Error(`KMS encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Simple KMS decryption
 * Expects base64-encoded ciphertext blob
 */
export async function decryptWithKMS(encryptedData: string): Promise<string> {
  try {
    const command = new DecryptCommand({
      CiphertextBlob: Buffer.from(encryptedData, 'base64')
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