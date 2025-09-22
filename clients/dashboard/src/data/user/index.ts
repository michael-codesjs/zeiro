import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchCurrentUser, User } from './fetch-user'
import { updateUser, UpdateUserData } from './update-user'
import { userQueryKeys } from './query-keys'

// Re-export types and functions for convenience
export type { User, UpdateUserData }
export { fetchCurrentUser, updateUser, userQueryKeys }

interface UseUserReturn {
  user: User | null
  loading: boolean
  error: string | null
  refetchUser: () => void
  updateUser: (data: UpdateUserData) => Promise<void>
  isUpdating: boolean
}

export function useUser(): UseUserReturn {
  const queryClient = useQueryClient()
  
  // Query for current user
  const {
    data: user,
    isLoading: loading,
    error: userError,
    refetch: refetchUser
  } = useQuery({
    queryKey: userQueryKeys.current(),
    queryFn: () => fetchCurrentUser(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 0,
  })

  // Mutation for updating user
  const updateUserMutation = useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      // Invalidate and refetch user data
      queryClient.invalidateQueries({ queryKey: userQueryKeys.current() })
    },
  })

  return {
    user: user || null,
    loading,
    error: userError?.message || null,
    refetchUser,
    updateUser: updateUserMutation.mutateAsync,
    isUpdating: updateUserMutation.isPending,
  }
}
