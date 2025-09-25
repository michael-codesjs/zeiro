import {
  EmailProvider,
  EmailMessage,
  EmailSendResult,
  EmailProviderConfig,
  EmailRecipient,
} from '../types'

/**
 * Resend email provider implementation
 */
export class ResendProvider implements EmailProvider {
  public readonly name = 'resend'
  private apiKey?: string
  private baseUrl = 'https://api.resend.com'

  configure(config: EmailProviderConfig): void {
    this.apiKey = config.apiKey
    if (config.endpoint) {
      this.baseUrl = config.endpoint
    }
  }

  async send(message: EmailMessage): Promise<EmailSendResult> {
    if (!this.apiKey) {
      throw new Error('Resend API key not configured')
    }

    try {
      const payload = this.formatMessage(message)
      
      const response = await fetch(`${this.baseUrl}/emails`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: result.message || `HTTP ${response.status}: ${response.statusText}`,
          provider: this.name,
        }
      }

      return {
        success: true,
        messageId: result.id,
        provider: this.name,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        provider: this.name,
      }
    }
  }

  private formatMessage(message: EmailMessage): any {
    const payload: any = {
      from: this.formatRecipient(message.from),
      to: Array.isArray(message.to) 
        ? message.to.map(r => this.formatRecipient(r))
        : [this.formatRecipient(message.to)],
      subject: message.subject,
    }

    if (message.html) {
      payload.html = message.html
    }

    if (message.text) {
      payload.text = message.text
    }

    if (message.cc) {
      payload.cc = Array.isArray(message.cc)
        ? message.cc.map(r => this.formatRecipient(r))
        : [this.formatRecipient(message.cc)]
    }

    if (message.bcc) {
      payload.bcc = Array.isArray(message.bcc)
        ? message.bcc.map(r => this.formatRecipient(r))
        : [this.formatRecipient(message.bcc)]
    }

    if (message.replyTo) {
      payload.reply_to = this.formatRecipient(message.replyTo)
    }

    if (message.attachments && message.attachments.length > 0) {
      payload.attachments = message.attachments.map(att => ({
        filename: att.filename,
        content: Buffer.isBuffer(att.content) 
          ? att.content.toString('base64')
          : Buffer.from(att.content).toString('base64'),
        content_type: att.contentType,
      }))
    }

    if (message.tags) {
      payload.tags = Object.entries(message.tags).map(([name, value]) => ({
        name,
        value,
      }))
    }

    if (message.headers) {
      payload.headers = message.headers
    }

    return payload
  }

  private formatRecipient(recipient: EmailRecipient): string {
    if (recipient.name) {
      return `${recipient.name} <${recipient.email}>`
    }
    return recipient.email
  }
}
