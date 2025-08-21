import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post, del } from 'aws-amplify/api';
import { toast } from 'react-hot-toast';

export type Credential ={
  id: string;
  user_id: string;
  name: string;
  type: string;
  provider: string;
  account_id?: string;
  access_key_id?: string;
  secret_access_key?: string;
  region?: string;
  status: 'active' | 'inactive' | 'expired';
  created_at: string;
  updated_at: string;
  last_used?: string;
}

const CREDENTIALS_QUERY_KEY = ['credentials'];

// Fetch credentials
const fetchCredentials = async (): Promise<Credential[]> => {
  const restOperation = get({
    apiName: 'zeiro-api',
    path: '/credentials',
    options: {
      queryParams: {
        page: '1',
        limit: '50'
      }
    }
  });
  
  const response = await restOperation.response;
  const data = await response.body.json() as unknown as { credentials: Credential[] };
  return data.credentials;
};

// Create credential
const createCredential = async (newCredential: Omit<Credential, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Credential> => {
  const restOperation = post({
    apiName: 'zeiro-api',
    path: '/credentials',
    options: {
      body: newCredential
    }
  });
  
  const response = await restOperation.response;
  return await response.body.json() as unknown as Credential;
};

// Delete credential
const deleteCredential = async (id: string): Promise<void> => {
  const restOperation = del({
    apiName: 'zeiro-api',
    path: `/credentials/${id}`,
  });
  
  await restOperation.response;
};

// Hooks
export const useCredentials = () => {
  return useQuery({
    queryKey: CREDENTIALS_QUERY_KEY,
    queryFn: fetchCredentials,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateCredential = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createCredential,
    onSuccess: (newCredential) => {
      // Optimistically update the cache
      queryClient.setQueryData<Credential[]>(CREDENTIALS_QUERY_KEY, (old) => 
        old ? [...old, newCredential] : [newCredential]
      );
      toast.success('Credentials created successfully');
    },
    onError: (error) => {
      console.error('Error creating credential:', error);
      toast.error('Failed to create credentials');
    },
  });
};

export const useDeleteCredential = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteCredential,
    onSuccess: (_, deletedId) => {
      // Optimistically update the cache
      queryClient.setQueryData<Credential[]>(CREDENTIALS_QUERY_KEY, (old) => 
        old ? old.filter(c => c.id !== deletedId) : []
      );
      toast.success('Credentials deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting credential:', error);
      toast.error('Failed to delete credentials');
    },
  });
}; 