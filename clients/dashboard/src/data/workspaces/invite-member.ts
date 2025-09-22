import { post } from 'aws-amplify/api';

export type InviteMemberData = {
  email: string;
  role: 'admin' | 'member' | 'guest';
  message?: string;
};

export const inviteMember = async ({ workspaceId, data }: { workspaceId: string; data: InviteMemberData }): Promise<void> => {
  try {
    const restOperation = post({
      apiName: 'zeiro-api',
      path: `/workspaces/${workspaceId}/members/invite`,
      options: {
        body: data,
      },
    });

    await restOperation.response;
  } catch (err) {
    console.error('Error inviting member:', err);
    // For development, just log the invitation
    console.log('Mock invitation sent:', { workspaceId, ...data });
  }
};
