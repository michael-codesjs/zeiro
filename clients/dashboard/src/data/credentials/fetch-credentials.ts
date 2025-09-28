import { get } from 'aws-amplify/api';

export type CredentialType = 'iam_access_keys' | 'service_account_keys' | 'service_principals' | 'connection_details';
export type CredentialStatus = 'active' | 'inactive' | 'expired';

export type BaseCredential = {
  id: string;
  user_id: string;
  name: string;
  type: CredentialType;
  status: CredentialStatus;
  created_at: string;
  updated_at: string;
  last_used?: string;
};

export type IAMAccessKeysCredential = BaseCredential & {
  type: 'iam_access_keys';
  account_id: string;
  access_key_id: string;
  secret_access_key: string; // Will be masked in response
  region?: string;
};

export type ServiceAccountKeysCredential = BaseCredential & {
  type: 'service_account_keys';
  service_account_key: string; // Will be masked in response
  project_id?: string;
};

export type ServicePrincipalsCredential = BaseCredential & {
  type: 'service_principals';
  client_id: string;
  client_secret: string; // Will be masked in response
  tenant_id: string;
  subscription_id?: string;
};

export type ConnectionDetailsCredential = BaseCredential & {
  type: 'connection_details';
  host: string;
  port: number;
  database: string;
  username: string;
  password: string; // Will be masked in response
  ssl?: boolean;
};

export type Credential = IAMAccessKeysCredential | ServiceAccountKeysCredential | ServicePrincipalsCredential | ConnectionDetailsCredential;

export type CredentialListResponse = {
  credentials: Credential[];
  total: number;
  page: number;
  limit: number;
};

export interface FetchCredentialsParams {
  type?: CredentialType;
  page?: number;
  limit?: number;
}

export const fetchCredentials = async (params: FetchCredentialsParams = {}): Promise<CredentialListResponse> => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.type) {
      queryParams.append('type', params.type);
    }
    if (params.page) {
      queryParams.append('page', params.page.toString());
    }
    if (params.limit) {
      queryParams.append('limit', params.limit.toString());
    }

    const path = `/credentials${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    const restOperation = get({
      apiName: 'zeiro-api',
      path,
    });

    const response = await restOperation.response;
    
    if (response.statusCode !== 200) {
      throw new Error(`Failed to fetch credentials: ${response.statusCode}`);
    }

    const credentialsData = await response.body.json() as CredentialListResponse;
    return credentialsData;
    
  } catch (err) {
    console.error('Error fetching credentials:', err);
    throw err;
  }
};
