import { post } from 'aws-amplify/api';
import { Credential, CredentialType } from './fetch-credentials';

export type CreateCredentialInput = {
  name: string;
  type: CredentialType;
  status?: 'active' | 'inactive';
} & (
  | {
      type: 'iam_access_keys';
      account_id: string;
      access_key_id: string;
      secret_access_key: string;
      region?: string;
    }
  | {
      type: 'service_account_keys';
      service_account_key: string;
      project_id?: string;
    }
  | {
      type: 'service_principals';
      client_id: string;
      client_secret: string;
      tenant_id: string;
      subscription_id?: string;
    }
  | {
      type: 'connection_details';
      host: string;
      port: number;
      database: string;
      username: string;
      password: string;
      ssl?: boolean;
    }
);

export const createCredential = async (input: CreateCredentialInput): Promise<Credential> => {
  try {
    const restOperation = post({
      apiName: 'zeiro-api',
      path: '/credentials',
      options: {
        body: input,
      },
    });

    const response = await restOperation.response;
    
    if (response.statusCode !== 201) {
      throw new Error(`Failed to create credential: ${response.statusCode}`);
    }

    const credentialData = await response.body.json() as Credential;
    return credentialData;
    
  } catch (err) {
    console.error('Error creating credential:', err);
    throw err;
  }
};
