import { User } from '@typings/user'
import {
  withCommonInput,
  withLambdaIOStandard,
  CommonInputHandler,
} from '@zeiro/sdk'
import { v4 as uuidv4 } from 'uuid'
import { EventBridgeAdapter } from '@adapters/secondary/event-bridge'
import { USER_CREATED_DOMAIN_EVENT } from '@typings/domain-events'
import { users } from '@zeiro/domain'
import { CREATE_USER_COMMAND } from '@typings/commands'

const inputMapper = async (
  input: CREATE_USER_COMMAND,
): Promise<User> => {

  // Initialize EventBridge adapter outside the handler for better performance
  const eventBridgeAdapter = new EventBridgeAdapter()

  const id = uuidv4() // generate own internal id, do not use cognito id
  const cognito_user_id = input.payload.id

  console.log('input', JSON.stringify(input, null, 2))

  const user = await users.create({
    ...input.payload,
    id,
    cognito_user_id,
    created_at: new Date(),
    updated_at: new Date(),
    discontinued: false,
    password: '',
  })
  
  const event: USER_CREATED_DOMAIN_EVENT = {
    id,
    source: 'zeiro.domain.user.services.user',
    name: 'USER_CREATED',
    payload: user,
    date: new Date(),
  }
  
  await eventBridgeAdapter.publish([event])
  
  return user as User

}

/** 'createUser' lambda function handler. */
export const handler: CommonInputHandler<CREATE_USER_COMMAND, User> =
  withCommonInput(inputMapper, {
    singular: true as true,
  })

/** 'createUser' lambda function handler wrapped in required middleware. */
export const main = withLambdaIOStandard(handler)
