import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { 
  fetchCredentials, 
  FetchCredentialsParams,
  Credential,
  CredentialListResponse,
  CredentialType,
  CredentialStatus
} from './fetch-credentials';
import { createCredential, CreateCredentialInput } from './create-credential';
import { updateCredential, UpdateCredentialInput } from './update-credential';
import { deleteCredential } from './delete-credential';
import { credentialsQueryKeys } from './query-keys';

// Re-export types for convenience
export type { 
  Credential, 
  CredentialListResponse, 
  FetchCredentialsParams,
  CredentialType,
  CredentialStatus,
  CreateCredentialInput,
  UpdateCredentialInput
};
export { fetchCredentials, createCredential, updateCredential, deleteCredential, credentialsQueryKeys };

interface UseCredentialsReturn {
  credentials: Credential[];
  total: number;
  page: number;
  limit: number;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  createCredential: (input: CreateCredentialInput) => Promise<Credential>;
  updateCredential: (id: string, input: UpdateCredentialInput) => Promise<Credential>;
  deleteCredential: (id: string) => Promise<void>;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
}

export function useCredentials(params: FetchCredentialsParams = {}): UseCredentialsReturn {
  const queryClient = useQueryClient();
  
  // Query for credentials list
  const {
    data: credentialsData,
    isLoading: loading,
    error: credentialsError,
    refetch
  } = useQuery({
    queryKey: credentialsQueryKeys.list(params),
    queryFn: () => fetchCredentials(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 1,
  });

  // Create credential mutation
  const createCredentialMutation = useMutation({
    mutationFn: createCredential,
    onSuccess: (newCredential) => {
      // Invalidate and refetch credentials list
      queryClient.invalidateQueries({ queryKey: credentialsQueryKeys.lists() });
      toast.success(`Credential "${newCredential.name}" created successfully`);
    },
    onError: (error) => {
      console.error('Error creating credential:', error);
      toast.error('Failed to create credential. Please try again.');
    },
  });

  // Update credential mutation
  const updateCredentialMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateCredentialInput }) => 
      updateCredential(id, input),
    onSuccess: (updatedCredential) => {
      // Invalidate and refetch credentials list
      queryClient.invalidateQueries({ queryKey: credentialsQueryKeys.lists() });
      toast.success(`Credential "${updatedCredential.name}" updated successfully`);
    },
    onError: (error) => {
      console.error('Error updating credential:', error);
      toast.error('Failed to update credential. Please try again.');
    },
  });

  // Delete credential mutation
  const deleteCredentialMutation = useMutation({
    mutationFn: deleteCredential,
    onSuccess: () => {
      // Invalidate and refetch credentials list
      queryClient.invalidateQueries({ queryKey: credentialsQueryKeys.lists() });
      toast.success('Credential deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting credential:', error);
      toast.error('Failed to delete credential. Please try again.');
    },
  });

  return {
    credentials: credentialsData?.credentials || [],
    total: credentialsData?.total || 0,
    page: credentialsData?.page || 1,
    limit: credentialsData?.limit || 10,
    loading,
    error: credentialsError?.message || null,
    refetch,
    createCredential: createCredentialMutation.mutateAsync,
    updateCredential: (id: string, input: UpdateCredentialInput) => 
      updateCredentialMutation.mutateAsync({ id, input }),
    deleteCredential: deleteCredentialMutation.mutateAsync,
    isCreating: createCredentialMutation.isPending,
    isUpdating: updateCredentialMutation.isPending,
    isDeleting: deleteCredentialMutation.isPending,
  };
}
