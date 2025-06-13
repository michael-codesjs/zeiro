import { DomainEvent } from '@zeiro/sdk'
import { User } from './user'

export type USER_CREATED_DOMAIN_EVENT = DomainEvent<
  'zeiro.domain.users.services.user',
  'USER_CREATED',
  User
> 