import {
  withCommonInput,
  withLambdaIOStandard,
  CommonInputHandler,
} from '@zeiro/sdk'
import { User } from '@typings/user'
import { users } from '@adapters/secondary/one-table'

const inputMapper = async (
  input: User,
): Promise<User> => {
  const user = await users.update(input as never)
  return user
}

/** 'createUser' lambda function handler. */
export const handler: CommonInputHandler<User, User> =
  withCommonInput(inputMapper, {
    singular: true as true,
  })

/** 'createUser' lambda function handler wrapped in required middleware. */
export const main = withLambdaIOStandard(handler)
