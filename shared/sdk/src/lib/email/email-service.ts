import {
  EmailMessage,
  EmailSendResult,
} from './types'
import { ResendProvider } from './providers'

/**
 * Send an email using Resend provider
 * Defaults to using RESEND_API_KEY from environment variables
 */
export async function sendEmail(message: EmailMessage): Promise<EmailSendResult> {
  try {
    // Validate required fields
    if (!message.from) {
      throw new Error('From address is required')
    }

    if (!message.to) {
      throw new Error('To address is required')
    }

    if (!message.subject) {
      throw new Error('Subject is required')
    }

    if (!message.html && !message.text) {
      throw new Error('Either HTML or text content is required')
    }

    // Initialize Resend provider with API key from environment
    const provider = new ResendProvider()
    provider.configure({
      apiKey: process.env.RESEND_API_KEY
    })

    return await provider.send(message)
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      provider: 'resend',
    }
  }
}
