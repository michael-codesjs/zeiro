import { EmailMessage, EmailRecipient } from './types'
import { sendEmail } from './email-service'

/**
 * Helper function to send an email with default from address
 */
export async function sendEmailWithDefaults(
  message: Omit<EmailMessage, 'from'>,
  defaultFrom?: EmailRecipient
) {
  const fromAddress = defaultFrom || {
    email: process.env.FROM_EMAIL || 'noreply@usezeiro.com',
    name: 'Zeiro Team'
  }

  return sendEmail({
    ...message,
    from: fromAddress
  })
}
