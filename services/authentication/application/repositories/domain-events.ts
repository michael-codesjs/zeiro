import { DomainEvent as TDomainEvent } from '@zeiro/sdk'
import { EventBridgeAdapter } from '@adapters/secondary'
import { EventAdapter } from '@interfaces'

export class DomainEventsRepository {
  private adapter: EventAdapter

  constructor() {
    this.adapter = new EventBridgeAdapter()
  }

  async publish(events: Array<TDomainEvent>) {
    return await this.adapter.publish(events)
  }
}
