export type DATA_SOURCE_CREATED_DOMAIN_EVENT = {
  id: string
  source: string
  name: 'DATA_SOURCE_CREATED'
  payload: {
    id: string
    user_id: string
    name: string
    type: string
    environment: string
    credential_id: string
  }
  date: Date
}

export type DATA_SOURCE_UPDATED_DOMAIN_EVENT = {
  id: string
  source: string
  name: 'DATA_SOURCE_UPDATED'
  payload: {
    id: string
    user_id: string
    changes: Record<string, any>
  }
  date: Date
}

export type DATA_SOURCE_DELETED_DOMAIN_EVENT = {
  id: string
  source: string
  name: 'DATA_SOURCE_DELETED'
  payload: {
    id: string
    user_id: string
    name: string
    type: string
  }
  date: Date
}

export type DATA_SOURCE_CONNECTED_DOMAIN_EVENT = {
  id: string
  source: string
  name: 'DATA_SOURCE_CONNECTED'
  payload: {
    id: string
    user_id: string
    connectedAt: Date
    metadata?: Record<string, any>
  }
  date: Date
}

export type DATA_SOURCE_DISCONNECTED_DOMAIN_EVENT = {
  id: string
  source: string
  name: 'DATA_SOURCE_DISCONNECTED'
  payload: {
    id: string
    user_id: string
    disconnectedAt: Date
    reason?: string
  }
  date: Date
}

export type DATA_SOURCE_ACCESSED_DOMAIN_EVENT = {
  id: string
  source: string
  name: 'DATA_SOURCE_ACCESSED'
  payload: {
    id: string
    user_id: string
    accessedAt: Date
    operation?: string
  }
  date: Date
}

export type DATA_SOURCE_CONNECTION_FAILED_DOMAIN_EVENT = {
  id: string
  source: string
  name: 'DATA_SOURCE_CONNECTION_FAILED'
  payload: {
    id: string
    user_id: string
    error: string
    failedAt: Date
  }
  date: Date
} 