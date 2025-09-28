import { FetchCredentialsParams } from './fetch-credentials';

export const credentialsQueryKeys = {
  all: ['credentials'] as const,
  lists: () => [...credentialsQueryKeys.all, 'list'] as const,
  list: (params: FetchCredentialsParams) => [...credentialsQueryKeys.lists(), params] as const,
  details: () => [...credentialsQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...credentialsQueryKeys.details(), id] as const,
};
