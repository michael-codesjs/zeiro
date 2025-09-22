import { UserDomainCommandsRepositroy } from '@repositories'

export type CreateUserUseCaseParams = { 
  id: string
  email: string
  name: string
  invitation_token?: string
  [k: string]: string | undefined
}

export type CreateUserUseCase = (
  params: CreateUserUseCaseParams,
) => Promise<void>

export const createUser: CreateUserUseCase = async (params) => {
  // Pass all params including invitation_token to the user service
  // The user service will handle invitation acceptance or workspace creation
  const userDomainCommandsRepository = new UserDomainCommandsRepositroy()
  await userDomainCommandsRepository.sendCreateUserCommand(params)
}
