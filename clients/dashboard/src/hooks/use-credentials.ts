import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post, del } from 'aws-amplify/api';
import { toast } from 'react-hot-toast';

export type Credential = {
  id: string;
  user_id: string;
  workspace_id: string;
  name: string;
  type: 'aws' | 'gcp' | 'azure' | 'database';
  status: 'active' | 'inactive' | 'expired';
  created_at: string;
  updated_at: string;
  last_used?: string;
  
  // AWS specific fields
  account_id?: string;
  access_key_id?: string;
  secret_access_key?: string; // This will be masked in responses
  region?: string;
  
  // GCP specific fields
  service_account_key?: string; // This will be masked in responses
  project_id?: string;
  
  // Azure specific fields
  client_id?: string;
  client_secret?: string; // This will be masked in responses
  tenant_id?: string;
  subscription_id?: string;
  
  // Database specific fields
  host?: string;
  port?: number;
  database?: string;
  username?: string;
  password?: string; // This will be masked in responses
  ssl?: boolean;
}

const CREDENTIALS_QUERY_KEY = ['credentials'];

// Fetch credentials
const fetchCredentials = async (type?: string): Promise<Credential[]> => {
  const queryParams: Record<string, string> = {
    page: '1',
    limit: '50'
  };
  
  if (type && type !== 'all') {
    queryParams.type = type;
  }
  
  const restOperation = get({
    apiName: 'zeiro-api',
    path: '/credentials',
    options: {
      queryParams
    }
  });
  
  const response = await restOperation.response;
  const data = await response.body.json() as unknown as { credentials: Credential[]; total: number; page: number; limit: number };
  return data.credentials || [];
};

// Create credential input type
export type CreateCredentialInput = {
  name: string;
  type: 'aws' | 'gcp' | 'azure' | 'database';
  
  // Connection details - will be flattened on the backend
  connection_details?: {
    // AWS fields
    account_id?: string;
    access_key_id?: string;
    secret_access_key?: string;
    region?: string;
    
    // GCP fields
    service_account_key?: string;
    project_id?: string;
    
    // Azure fields
    client_id?: string;
    client_secret?: string;
    tenant_id?: string;
    subscription_id?: string;
    
    // Database fields
    host?: string;
    port?: number;
    database?: string;
    username?: string;
    password?: string;
    ssl?: boolean;
  };
};

// Create credential
const createCredential = async (newCredential: CreateCredentialInput): Promise<Credential> => {
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
export const useCredentials = (type?: string) => {
  return useQuery({
    queryKey: [...CREDENTIALS_QUERY_KEY, type],
    queryFn: () => fetchCredentials(type),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateCredential = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createCredential,
    onSuccess: (newCredential) => {
      // Invalidate all credentials queries to refetch data
      queryClient.invalidateQueries({ queryKey: CREDENTIALS_QUERY_KEY });
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
      // Invalidate all credentials queries to refetch data
      queryClient.invalidateQueries({ queryKey: CREDENTIALS_QUERY_KEY });
      toast.success('Credentials deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting credential:', error);
      toast.error('Failed to delete credentials');
    },
  });
}; 