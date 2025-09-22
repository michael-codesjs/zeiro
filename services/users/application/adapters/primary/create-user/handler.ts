import { User } from '@typings/user'
import {
  withCommonInput,
  withLambdaIOStandard,
  CommonInputHandler,
  apiGatewaySignedFetch,
} from '@zeiro/sdk'
import { v4 as uuidv4 } from 'uuid'
import { EventBridgeAdapter } from '@adapters/secondary/event-bridge'
import { USER_CREATED_DOMAIN_EVENT } from '@typings/domain-events'
import { users, workspaces , workspaceMemberships} from '@zeiro/domain'
import { CREATE_USER_COMMAND } from '@typings/commands'

const inputMapper = async (
  input: CREATE_USER_COMMAND,
): Promise<User> => {

  // Initialize EventBridge adapter outside the handler for better performance
  const eventBridgeAdapter = new EventBridgeAdapter()

  const id = uuidv4() // generate own internal id, do not use cognito id
  const cognito_user_id = input.payload.id

  console.log('input', JSON.stringify(input, null, 2))

  // Create default workspace synchronously using signed API Gateway request
  let workspace_id = ''
  try {
    const workspaceResponse = await apiGatewaySignedFetch(`${process.env.WORKSPACE_API_URL || 'https://api.usezeiro.com'}/workspaces/default`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: id,
        user_name: input.payload.name,
        user_email: input.payload.email,
      }),
    })

    if (!workspaceResponse.ok) {
      console.error('Failed to create default workspace:', await workspaceResponse.text())
      // Don't fail user creation if workspace creation fails
    } else {
      const workspaceData = await workspaceResponse.json()
      workspace_id = workspaceData.workspace_id
      console.log('Default workspace created successfully')
    }
  } catch (workspaceError) {
    console.error('Error calling workspace service:', workspaceError)
    // Fail user creation if workspace creation fails
    throw new Error('Failed to create default workspace for user')
  }

  const user = await users.create({
    ...input.payload,
    id,
    workspace_id: workspace_id,
    cognito_user_id,
    created_at: new Date().toJSON(),
    updated_at: new Date().toJSON(),
    discontinued: false,
    password: '',
  }).go()
  
  const event: USER_CREATED_DOMAIN_EVENT = {
    id,
    source: 'zeiro.domain.user.services.user',
    name: 'USER_CREATED',
    payload: user,
    date: new Date(),
  }
  
  await eventBridgeAdapter.publish([event])
  
  return user as unknown as User

}

/** 'createUser' lambda function handler. */
export const handler: CommonInputHandler<CREATE_USER_COMMAND, User> =
  withCommonInput(inputMapper, {
    singular: true as true,
  })

/** 'createUser' lambda function handler wrapped in required middleware. */
export const main = withLambdaIOStandard(handler)
