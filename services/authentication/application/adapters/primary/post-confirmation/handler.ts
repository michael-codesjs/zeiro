import { withLambdaStandard } from '@zeiro/sdk'
import { createUser } from '@use-cases'
import { PostConfirmationTriggerHandler } from 'aws-lambda'

/** 'postConfirmation' lambda function handler. */
const handler: PostConfirmationTriggerHandler = async (event) => {
  const { sub } = event.request.userAttributes
  console.log('cognito attributes', event.request.userAttributes)

  const usage_intent = event.request.userAttributes['custom:usage_intent']
  const role = event.request.userAttributes['custom:role']

  const { email, name } = event.request.userAttributes

  const params = { email, name, id: sub, usage_intent, role }

  console.log('params', params)

  await createUser(params)

  return event
}

/** 'postConfirmation' handler wrapped in required middleware. */
export const main = withLambdaStandard(handler)
