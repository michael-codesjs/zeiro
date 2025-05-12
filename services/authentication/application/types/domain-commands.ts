import { DomainCommand } from '@zeiro/sdk'

export type CreateUserDomainCommand = DomainCommand<
  'zeiro.services.cognito.confirmSignUp',
  'CREATE_USER',
  { id: string; [k: string]: any }
>

export type CheckIfUserWithUsernameAttributeExistsCommand = DomainCommand<
  'zeiro.services.cognito.preSignUp',
  'CHECK_IF_USER_WITH_USERNAME_ATTRIBUTES_EXISTS',
  { phoneNumber?: string; email?: string }
>
