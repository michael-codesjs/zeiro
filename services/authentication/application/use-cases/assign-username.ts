import {
  CognitoIdentityProviderClient,
  AdminUpdateUserAttributesCommand,
  SchemaAttributeType,
  UserPoolClientType,
  UserPoolType,
  DescribeUserPoolCommand,
} from '@aws-sdk/client-cognito-identity-provider'
import { configureEnviromentVariables } from '@zeiro/sdk'

const { REGION, USER_POOL_ID } = configureEnviromentVariables()

/**
 * Input parameters for the assignUsername use case
 */
type AssignUsernameParams = {
  user_id: string
  username: string
}

/**
 * Assigns a generated username to a Cognito user
 *
 * This use case updates the Cognito user's attributes to include
 * the generated username as the preferred_username attribute.
 *
 * Note: If the preferred_username attribute is not set up in the Cognito user pool,
 * this operation will fail. The attribute needs to be added to the user pool schema.
 *
 * @param params - Object containing user_id and username
 * @returns Promise that resolves when the username is assigned
 * @throws Error if the operation fails
 */
export const assignUsername = async (
  params: AssignUsernameParams,
): Promise<void> => {
  const { user_id, username } = params

  if (!user_id) {
    throw new Error('User ID is required for username assignment')
  }

  if (!username) {
    throw new Error('Username is required for username assignment')
  }

  if (!USER_POOL_ID) {
    throw new Error('USER_POOL_ID environment variable is not set')
  }

  try {
    // Create the Cognito Identity Provider client
    const client = new CognitoIdentityProviderClient({
      region: REGION || 'eu-central-1',
    })

    // Create the command to update the user attributes
    const command = new AdminUpdateUserAttributesCommand({
      UserPoolId: USER_POOL_ID,
      Username: user_id,
      UserAttributes: [
        {
          Name: 'preferred_username',
          Value: username,
        },
      ],
    })

    // Send the command to update the user attributes
    await client.send(command)

    console.log('Username assigned successfully', {
      user_id,
      username,
      user_pool_id: USER_POOL_ID,
    })
  } catch (error) {
    // Check if the error is related to the preferred_username attribute not being set up
    if (
      error.name === 'InvalidParameterException' &&
      error.message.includes('Invalid attribute preferred_username')
    ) {
      console.error(
        'The preferred_username attribute is not set up in the Cognito user pool',
        {
          user_id,
          username,
          user_pool_id: USER_POOL_ID,
          error_message: error.message,
        },
      )
      throw new Error(
        'The preferred_username attribute is not set up in the Cognito user pool. ' +
          'Please add this attribute to the user pool schema.',
      )
    }

    // Log the error with context
    console.error('Failed to assign username to Cognito user', {
      user_id,
      username,
      user_pool_id: USER_POOL_ID,
      error_message: error.message,
      error_name: error.name,
    })

    // Rethrow with clear error message
    throw new Error(
      `Failed to assign username to Cognito user: ${error.message}`,
    )
  }
}
