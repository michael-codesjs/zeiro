import { EventBridgeClient, PutEventsCommand } from '@aws-sdk/client-eventbridge'
import { DomainEvent } from '@zeiro/sdk'

export class EventBridgeAdapter {
  private client: EventBridgeClient
  private eventBusName: string

  constructor() {
    this.client = new EventBridgeClient({ region: process.env.AWS_REGION })
    this.eventBusName = process.env.CENTRAL_EVENT_BUS_NAME || 'zeiro-dev-central-event-bus'
  }

  async publish(events: DomainEvent<string, string, any>[]): Promise<void> {
    const entries = events.map((event) => ({
      Source: event.source,
      DetailType: event.name,
      Detail: JSON.stringify(event),
      EventBusName: this.eventBusName,
    }))

    const command = new PutEventsCommand({
      Entries: entries,
    })

    try {
      const result = await this.client.send(command)
      console.log('Events published successfully:', result)
    } catch (error) {
      console.error('Failed to publish events:', error)
      throw error
    }
  }
}
