import { withLambdaStandard } from '@zeiro/sdk'
import { preSignUp } from '@use-cases/pre-sign-up'
import { PreSignUpTriggerHandler } from 'aws-lambda'

/** 'preSignUp' lambda function handler. */
const handler: PreSignUpTriggerHandler = async (event) => {
  const { email } = event.request.userAttributes

  const preSignUpParams: { email?: string } = {}

  if (email) preSignUpParams.email = email

  const { confirmed, emailVerified } = await preSignUp(preSignUpParams)

  event.response.autoConfirmUser = true
  event.response.autoVerifyEmail = emailVerified

  return event
}

/** 'preSignUp' handler wrapped in required middleware. */
export const main = withLambdaStandard(handler)
