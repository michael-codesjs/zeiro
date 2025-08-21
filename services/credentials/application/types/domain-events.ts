import { Credential } from './credential'

export type CREDENTIAL_CREATED_DOMAIN_EVENT = {
  id: string
  source: string
  name: 'CREDENTIAL_CREATED'
  payload: Credential
  date: Date
}

export type CREDENTIAL_UPDATED_DOMAIN_EVENT = {
  id: string
  source: string
  name: 'CREDENTIAL_UPDATED'
  payload: Credential
  date: Date
}

export type CREDENTIAL_DELETED_DOMAIN_EVENT = {
  id: string
  source: string
  name: 'CREDENTIAL_DELETED'
  payload: {
    id: string
    user_id: string
    name: string
    type: string
  }
  date: Date
}

export type CREDENTIAL_USED_DOMAIN_EVENT = {
  id: string
  source: string
  name: 'CREDENTIAL_USED'
  payload: {
    id: string
    user_id: string
    usedAt: Date
    context?: string
  }
  date: Date
} 