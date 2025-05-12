import { users } from '@adapters/secondary/one-table'
import { User } from '@typings/user'
import {
  withCommonInput,
  withLambdaIOStandard,
  CommonInputHandler,
} from '@zeiro/sdk'

const inputMapper = async (
  input: User,
): Promise<User> => {

  const user = await users.create(input as never)
  return user
}

/** 'createUser' lambda function handler. */
export const handler: CommonInputHandler<User, User> =
  withCommonInput(inputMapper, {
    singular: true as true,
  })

/** 'createUser' lambda function handler wrapped in required middleware. */
export const main = withLambdaIOStandard(handler)
