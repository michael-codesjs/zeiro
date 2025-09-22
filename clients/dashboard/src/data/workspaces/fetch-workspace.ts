import { get } from 'aws-amplify/api';

export type Workspace = {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  created_at: string;
  updated_at: string;
  membership: {
    role: 'owner' | 'admin' | 'member' | 'guest';
    status: 'active' | 'pending' | 'disabled';
  };
  member_count: number;
};

export type WorkspaceMember = {
  id: string;
  user_id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'member' | 'guest';
  joined_at?: string;
  invited_by?: string;
};

export const fetchWorkspace = async (id: string): Promise<{ workspace: Workspace | null; members: WorkspaceMember[] }> => {
  try {
    const restOperation = get({
      apiName: 'zeiro-api',
      path: `/workspaces/${id}`,
    });

    const response = await restOperation.response;

    console.log('Workspace API response:', response);
    
    const data = await response.body.json();
    console.log('Workspace data:', data);

    // Extract workspace data and members
    const { members = [], ...workspaceData } = data as any;

    // Ensure workspace has all required fields
    const workspace: Workspace = {
      id: workspaceData.id,
      name: workspaceData.name || 'Unnamed Workspace',
      description: workspaceData.description,
      logo: workspaceData.logo,
      created_at: workspaceData.created_at,
      updated_at: workspaceData.updated_at,
      membership: workspaceData.membership || { role: 'member', status: 'active' },
      member_count: workspaceData.member_count || members.length || 0,
    };

    return {
      workspace,
      members: members || []
    };
  } catch (err) {
    console.error('Error fetching workspace:', err);
    return {
      workspace: null,
      members: []
    };
  }
};
