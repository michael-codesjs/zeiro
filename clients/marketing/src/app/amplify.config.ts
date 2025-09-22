'use client'

import { Amplify, ResourcesConfig } from 'aws-amplify'
import { CookieStorage } from 'aws-amplify/utils'
import { cognitoUserPoolsTokenProvider } from 'aws-amplify/auth/cognito'

const env = process.env.NEXT_PUBLIC_ENV

const resourcesConfig: ResourcesConfig = {
  Auth: {
    Cognito: {
      userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID!,
      userPoolClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,
    },
  },
  API: {
    REST: {
      'zeiro-api': {
        endpoint: process.env.NEXT_PUBLIC_REST_API_URL || 'https://api.usezeiro.com',
        region: process.env.NEXT_PUBLIC_AWS_REGION || 'eu-central-1',
      },
    },
  },
}

const libraryOptions = { ssr: true }
const cookieStorage = new CookieStorage({
  domain: env === 'prod' ? '.usezeiro.com' : 'localhost',
  path: '/',
  expires: 365,
  sameSite: 'lax',
})

Amplify.configure(resourcesConfig, libraryOptions)
cognitoUserPoolsTokenProvider.setKeyValueStorage(cookieStorage)

export default function ConfigureAmplifyClientSide() {
  return null
}
