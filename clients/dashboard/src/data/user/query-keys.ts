export const userQueryKeys = {
  all: ['user'] as const,
  current: () => [...userQueryKeys.all, 'current'] as const,
  byId: (userId: string) => [...userQueryKeys.all, 'byId', userId] as const,
};
