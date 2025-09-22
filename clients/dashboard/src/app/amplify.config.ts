'use client'

import { Amplify, ResourcesConfig } from 'aws-amplify'
import { CookieStorage } from 'aws-amplify/utils'
import { cognitoUserPoolsTokenProvider } from 'aws-amplify/auth/cognito'
import { fetchAuthSession } from 'aws-amplify/auth'
import { generateClient } from 'aws-amplify/api'

const env = process.env.NEXT_PUBLIC_ENV

// Configure cookie storage for SSR/CSR
cognitoUserPoolsTokenProvider.setKeyValueStorage(
  new CookieStorage({
    domain: env === 'prod' ? '.usezeiro.com' : 'localhost',
    path: '/',
    expires: 365,
    sameSite: 'lax',
    secure: env === 'prod',
  }),
)

const resourcesConfig: ResourcesConfig = {
  Auth: {
    Cognito: {
      userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID!,
      userPoolClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,
    },
  },
  API: {
    // GraphQL: {
    //   endpoint: process.env.NEXT_PUBLIC_APPSYNC_URL!,
    //   region: process.env.NEXT_PUBLIC_AWS_REGION || 'eu-central-1',
    //   defaultAuthMode: 'userPool',
    // },
    REST: {
      'zeiro-api': {
        endpoint: process.env.NEXT_PUBLIC_REST_API_URL!,
        region: process.env.NEXT_PUBLIC_AWS_REGION || 'eu-central-1',
      },
    },
  },
}

// WebSocket configuration
export const WEBSOCKET_CONFIG = {
  url: process.env.NEXT_PUBLIC_WEBSOCKET_URL,
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'eu-central-1',
}

const libraryOptions: Parameters<typeof Amplify.configure>[1] = { 
  ssr: true,
  API: {
    REST: {
      headers: async () => {
        const session = await fetchAuthSession()
        const token = session.tokens?.idToken?.toString()
        return {
          Authorization: `Bearer ${token}`
        }
      }
    }
  }
}

Amplify.configure(resourcesConfig, libraryOptions)
export const client = generateClient()

export default function ConfigureAmplifyClientSide() {
  return null
}
