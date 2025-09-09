import {
  withCommonInput,
  withLambdaIOStandard,
  CommonInputHandler,
} from '@zeiro/sdk'
import { User } from '@typings/user'
import { users } from '@zeiro/domain'

const inputMapper = async (
  input: User,
): Promise<boolean> => {
  const user = await users.update(input as never)
  return true
}

/** 'createUser' lambda function handler. */
export const handler: CommonInputHandler<User, boolean> =
  withCommonInput(inputMapper, {
    singular: true as true,
  })

/** 'createUser' lambda function handler wrapped in required middleware. */
export const main = withLambdaIOStandard(handler)
