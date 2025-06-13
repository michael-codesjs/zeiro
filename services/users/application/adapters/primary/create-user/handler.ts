import { users } from '@adapters/secondary/one-table'
import { User } from '@typings/user'
import {
  withCommonInput,
  withLambdaIOStandard,
  CommonInputHandler,
} from '@zeiro/sdk'
import { EventBridgeAdapter } from '@adapters/secondary/event-bridge'
import { USER_CREATED_DOMAIN_EVENT } from '@typings/domain-events'

// Initialize EventBridge adapter outside the handler for better performance
const eventBridgeAdapter = new EventBridgeAdapter()

const inputMapper = async (
  input: User,
): Promise<User> => {
  const user = await users.create({ ...input } as never)
  
  // Create and publish USER_CREATED event
  const eventBridgeAdapter = new EventBridgeAdapter()
  const userCreatedEvent: USER_CREATED_DOMAIN_EVENT = {
    id: user.id,
    source: 'zeiro.domain.users.services.user',
    name: 'USER_CREATED',
    payload: user,
    date: new Date(),
  }
  
  await eventBridgeAdapter.publish([userCreatedEvent])
  
  return user
}

/** 'createUser' lambda function handler. */
export const handler: CommonInputHandler<User, User> =
  withCommonInput(inputMapper, {
    singular: true as true,
  })

/** 'createUser' lambda function handler wrapped in required middleware. */
export const main = withLambdaIOStandard(handler)
