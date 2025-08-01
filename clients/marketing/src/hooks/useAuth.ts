import { useState, useEffect } from 'react'
import {
  signIn,
  signUp,
  confirmSignIn,
  signOut,
  getCurrentUser,
  fetchUserAttributes,
} from 'aws-amplify/auth'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

const APP_CLIENT_URL = process.env.NEXT_PUBLIC_APP_CLIENT_URL

// Input Types
interface SignInInput {
  username: string
  password: string
}

type SignUpInput = {
  email: string
  password: string
  full_name: string
  role: string
  usage_intent: string
}

interface UseAuthReturn {
  signInUser: (input: SignInInput) => Promise<void>
  signUpUser: (input: SignUpInput) => Promise<void>
  answerAuthenticationChallenge: (
    username: string,
    code: string,
  ) => Promise<void>
  handleSignOut: () => Promise<void>
  loading: boolean
  error: Error | null
  user: {
    username?: string
    attributes?: {
      name?: string
      picture?: string
      email?: string
    }
  } | null
}

export function useAuth(): Omit<UseAuthReturn, 'loading' | 'error'> {
  const [user, setUser] = useState<UseAuthReturn['user']>(null)
  const router = useRouter()

  useEffect(() => {
    // Fetch current user on mount
    const fetchUser = async () => {
      try {
        const currentUser = await getCurrentUser()
        const userAttributes = await fetchUserAttributes()
        setUser({
          username: currentUser.username,
          attributes: {
            name: userAttributes.name,
            email: userAttributes.email,
            picture: userAttributes.picture,
          },
        })
      } catch (err) {
        console.log('No user found')
      }
    }
    fetchUser()
  }, [])

  const handleError = (err: unknown) => {
    console.log('useAuth error', err)
    const errorMessage =
      err instanceof Error ? err.message : 'Something went wrong'
    toast.error(errorMessage)
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/')
      toast.success('Successfully signed out')
    } catch (err) {
      handleError(err)
    }
  }

  const signInUser = async ({ username, password }: SignInInput) => {
    try {
      const signInOutput = await signIn({
        username,
        password,
        options: {
          authFlowType: 'CUSTOM_WITH_SRP',
        },
      })

      console.log('signInOutput', signInOutput)

      // Handle different next steps
      switch (signInOutput.nextStep.signInStep) {
        case 'CONFIRM_SIGN_IN_WITH_CUSTOM_CHALLENGE':
          router.push(`/auth/code?username=${encodeURIComponent(username)}`)
          toast('Please verify your identity.')
          break

        default:
          console.log('signInUser default', signInOutput)
          throw new Error('Something went wrong')
      }
    } catch (err) {
      console.log('signInUser error', err)
      handleError(err)
    }
  }

  const signUpUser = async ({
    email,
    password,
    full_name,
    role,
    usage_intent
  }: SignUpInput) => {
    try {

      const result = await signUp({
        username: email,
        password,
        options: {
          userAttributes: {
            email,
            name: full_name,
            'custom:role': role,
            'custom:usage_intent': usage_intent
          },
        },
      })

      console.log('signUp result', result)

      switch (result.nextStep.signUpStep) {
        case 'DONE':
          await signInUser({ username: email, password })
          break

        default:
          throw new Error('Something went wrong')
      }
    } catch (err) {
      console.log('signUpUser error', err)
      handleError(err)
    }
  }

  const answerAuthenticationChallenge = async (
    username: string,
    code: string,
  ) => {
    try {
      const confirm_sign_in_output = await confirmSignIn({
        challengeResponse: code,
      })
      console.log('confirm_sign_in_output', confirm_sign_in_output)
      if (confirm_sign_in_output.isSignedIn) {
        toast.success('Account verified and signed in successfully!')
        window.location.reload()
      } else if (
        confirm_sign_in_output.nextStep.signInStep ===
        'CONFIRM_SIGN_IN_WITH_CUSTOM_CHALLENGE'
      ) {
        toast.error('Invalid code. Please try again.')
      } else {
        throw new Error('Something went wrong')
      }
    } catch (err) {
      console.log(err)
      handleError(err)
    }
  }

  return {
    signInUser,
    signUpUser,
    answerAuthenticationChallenge,
    handleSignOut,
    user,
  }
}
