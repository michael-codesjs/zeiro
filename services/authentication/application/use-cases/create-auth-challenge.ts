import {
  configureEnviromentVariables,
  WithPartial,
  DEFAULT_AUTH_CHALLENGE,
  sendEmail,
} from '@zeiro/sdk'
import * as digitGenerator from 'crypto-secure-random-digit'
import { createAuthCodeEmail } from '@templates/auth-code-email'

configureEnviromentVariables()

export type CreateAuthChallengeUseCaseParamsAllRequired = {
  email: string
  phoneNumber: string
}
export type CreateAuthChallengeUseCaseParamsEmailRequired = WithPartial<
  CreateAuthChallengeUseCaseParamsAllRequired,
  'phoneNumber'
>
export type CreateAuthChallengeUseCaseParamsPhoneNumberRequired = WithPartial<
  CreateAuthChallengeUseCaseParamsAllRequired,
  'email'
>

// type aliases
type A = CreateAuthChallengeUseCaseParamsAllRequired
type E = CreateAuthChallengeUseCaseParamsEmailRequired
type P = CreateAuthChallengeUseCaseParamsPhoneNumberRequired

export type CreateAuthChallengeUseCaseParams<T extends A | E | P> =
  T extends CreateAuthChallengeUseCaseParamsEmailRequired
    ? CreateAuthChallengeUseCaseParamsEmailRequired
    : T extends CreateAuthChallengeUseCaseParamsPhoneNumberRequired
      ? CreateAuthChallengeUseCaseParamsPhoneNumberRequired
      : CreateAuthChallengeUseCaseParamsAllRequired

export type CreateAuthChallengeUseCase = <T extends A | E | P>(
  params: CreateAuthChallengeUseCaseParams<T>,
) => Promise<string>

export const createAuthChallenge: CreateAuthChallengeUseCase = async (
  params,
) => {
  if (!('email' in params) && !('phoneNumber' in params))
    throw new Error('Either email or phoneNumber is required.')

  const STAGE = process.env.STAGE
  const challenge = digitGenerator.randomDigits(6).join('')
    // STAGE === 'prod'
      // ? 
      // '123456'
      // : DEFAULT_AUTH_CHALLENGE // genereate 6 digit OTP in prod, use DEFAULT_OTP in other stages.

  // Send email if email is provided
  if ('email' in params && params.email) {
    try {
      const authCodeEmail = createAuthCodeEmail({
        to: {
          email: params.email,
          name: params.email.split('@')[0] // Use email prefix as fallback name
        },
        from: {
          email: 'noreply@usezeiro.com',
          name: 'Zeiro'
        },
        code: challenge,
        expirationMinutes: 10
      })

      const emailResult = await sendEmail(authCodeEmail)
      
      if (!emailResult.success) {
        console.error('Failed to send auth code email:', emailResult.error)
        // Don't fail the entire auth flow if email fails, just log it
      } else {
        console.log('Auth code email sent successfully:', emailResult.messageId)
      }
    } catch (emailError) {
      console.error('Error sending auth code email:', emailError)
      // Don't fail the entire auth flow if email fails, just log it
    }
  }

  // TODO: send SMS if phoneNumber is provided

  return challenge
}
