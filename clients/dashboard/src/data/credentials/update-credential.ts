import { put } from 'aws-amplify/api';
import { Credential, CredentialType } from './fetch-credentials';

export type UpdateCredentialInput = {
  name?: string;
  status?: 'active' | 'inactive' | 'expired';
} & (
  | {
      type?: 'aws_access_keys';
      account_id?: string;
      access_key_id?: string;
      secret_access_key?: string;
      region?: string;
    }
  | {
      type?: 'database_connection';
      host?: string;
      port?: number;
      database_name?: string;
      username?: string;
      password?: string;
      ssl_enabled?: boolean;
    }
);

export const updateCredential = async (id: string, input: UpdateCredentialInput): Promise<Credential> => {
  try {
    const restOperation = put({
      apiName: 'zeiro-api',
      path: `/credentials/${id}`,
      options: {
        body: input,
      },
    });

    const response = await restOperation.response;
    
    if (response.statusCode !== 200) {
      throw new Error(`Failed to update credential: ${response.statusCode}`);
    }

    const credentialData = await response.body.json() as Credential;
    return credentialData;
    
  } catch (err) {
    console.error('Error updating credential:', err);
    throw err;
  }
};
