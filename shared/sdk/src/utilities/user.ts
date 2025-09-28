import { users } from '@zeiro/domain'

/**
 * User utility functions for common user operations
 */

export interface UserInfo {
  id: string
  cognito_user_id: string
  email: string
  name: string
  workspace_id: string
}

/**
 * Get user by Cognito User ID
 * @param cognito_user_id - The Cognito user ID from JWT claims (sub field)
 * @returns User information or null if not found
 */
export async function getUserByCognitoId(cognito_user_id: string): Promise<UserInfo | null> {
  try {
    const result = await users.query
      .byCognitoUser({ cognito_user_id })
      .go()
    
    const user = result.data && result.data.length > 0 ? result.data[0] : null
    
    if (!user) {
      return null
    }

    return {
      id: user.id,
      cognito_user_id: user.cognito_user_id,
      email: user.email,
      name: user.name,
      workspace_id: user.workspace_id,
    }
  } catch (error) {
    console.error('Error fetching user by cognito_user_id:', error)
    throw error
  }
}

/**
 * Get user by internal user ID
 * @param user_id - The internal user ID
 * @param workspace_id - The workspace ID for the user
 * @returns User information or null if not found
 */
export async function getUserById(user_id: string, workspace_id: string): Promise<UserInfo | null> {
  try {
    const result = await users.get({
      workspace_id,
      id: user_id,
    }).go()
    
    if (!result.data) {
      return null
    }

    const user = result.data

    return {
      id: user.id,
      cognito_user_id: user.cognito_user_id,
      email: user.email,
      name: user.name,
      workspace_id: user.workspace_id,
    }
  } catch (error) {
    console.error('Error fetching user by id:', error)
    throw error
  }
}

/**
 * Validate that a user exists and is authenticated
 * @param cognito_user_id - The Cognito user ID from JWT claims
 * @returns User information
 * @throws Error if user is not found or not authenticated
 */
export async function validateAuthenticatedUser(cognito_user_id: string | undefined): Promise<UserInfo> {
  if (!cognito_user_id) {
    throw new Error('User not authenticated')
  }

  const user = await getUserByCognitoId(cognito_user_id)
  
  if (!user) {
    throw new Error('User not found')
  }

  return user
}
