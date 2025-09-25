/**
 * Email attachment interface
 */
export interface EmailAttachment {
  filename: string
  content: string | Buffer
  contentType?: string
  encoding?: string
}

/**
 * Email recipient interface
 */
export interface EmailRecipient {
  email: string
  name?: string
}

/**
 * Email message interface
 */
export interface EmailMessage {
  to: EmailRecipient | EmailRecipient[]
  from: EmailRecipient
  subject: string
  html?: string
  text?: string
  cc?: EmailRecipient | EmailRecipient[]
  bcc?: EmailRecipient | EmailRecipient[]
  replyTo?: EmailRecipient
  attachments?: EmailAttachment[]
  headers?: Record<string, string>
  tags?: Record<string, string>
}

/**
 * Email send result interface
 */
export interface EmailSendResult {
  success: boolean
  messageId?: string
  error?: string
  provider: string
}

/**
 * Email provider configuration interface
 */
export interface EmailProviderConfig {
  apiKey?: string
  region?: string
  endpoint?: string
  [key: string]: any
}

/**
 * Abstract email provider interface
 */
export interface EmailProvider {
  name: string
  send(message: EmailMessage): Promise<EmailSendResult>
  configure(config: EmailProviderConfig): void
}

