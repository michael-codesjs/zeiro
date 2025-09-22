import { post } from 'aws-amplify/api';

export type InviteMemberData = {
  email: string;
  role: 'admin' | 'member' | 'guest';
  message?: string;
};

export const inviteMember = async ({ workspaceId, data }: { workspaceId: string; data: InviteMemberData }): Promise<void> => {
  const restOperation = post({
    apiName: 'zeiro-api',
    path: `/workspaces/${workspaceId}/members/invite`,
    options: {
      body: data,
    },
  });

  try {
    await restOperation.response;
  } catch (error: any) {
    console.log('Raw error:', error);
    
    // Extract error message from Amplify error structure
    let errorMessage = 'Failed to invite member';
    
    if (error?.response?.body) {
      try {
        const body = JSON.parse(error.response.body);
        if (body.error) {
          errorMessage = body.error;
        }
      } catch (e) {
        console.log('Could not parse error body');
      }
    }
    
    console.log('Throwing error:', errorMessage);
    throw new Error(errorMessage);
  }
};
