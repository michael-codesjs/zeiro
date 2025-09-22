"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchWorkspace, Workspace, WorkspaceMember } from './fetch-workspace';
import { inviteMember, InviteMemberData } from './invite-member';
import { updateWorkspace, UpdateWorkspaceData } from './update-workspace';
import { useUser } from '../user';

// Re-export types from other files
export type { Workspace, WorkspaceMember } from './fetch-workspace';
export type { InviteMemberData } from './invite-member';
export type { UpdateWorkspaceData } from './update-workspace';

// Query keys for React Query
export const workspaceQueryKeys = {
  all: ['workspaces'] as const,
  current: () => [...workspaceQueryKeys.all, 'current'] as const,
  members: (workspaceId: string) => [...workspaceQueryKeys.all, 'members', workspaceId] as const,
};

export function useWorkspaces() {
  const { user, loading: userLoading, error: userError } = useUser()
  const queryClient = useQueryClient();

  // Query for workspace - depends on user data
  const {
    data: workspaceData,
    isLoading: workspaceLoading,
    error: workspaceError,
    refetch: refetchWorkspace
  } = useQuery({
    queryKey: workspaceQueryKeys.current(),
    queryFn: () => fetchWorkspace(user!.workspace_id),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!user?.workspace_id, // Only run when we have a user with workspace_id
  });

  // Extract members from workspace data
  const members = workspaceData?.members || [];

  // Invite member mutation
  const inviteMemberMutation = useMutation({
    mutationFn: inviteMember,
    onSuccess: (_, { workspaceId }) => {
      // Invalidate workspace query to refetch updated data
      queryClient.invalidateQueries({ queryKey: workspaceQueryKeys.current() });
    },
  });

  // Update workspace mutation
  const updateWorkspaceMutation = useMutation({
    mutationFn: updateWorkspace,
    onSuccess: (_, { workspaceId }) => {
      // Invalidate workspace query to refetch updated data
      queryClient.invalidateQueries({ queryKey: workspaceQueryKeys.current() });
    },
  });

  return {
    workspace: workspaceData?.workspace || null,
    members,
    loading: userLoading || workspaceLoading,
    error: userError || workspaceError?.message || null,
    fetchWorkspace: refetchWorkspace,
    inviteMember: (workspaceId: string, data: InviteMemberData) => 
      inviteMemberMutation.mutateAsync({ workspaceId, data }),
    isInvitingMember: inviteMemberMutation.isPending,
    updateWorkspace: (workspaceId: string, data: UpdateWorkspaceData) => 
      updateWorkspaceMutation.mutateAsync({ workspaceId, data }),
    isUpdatingWorkspace: updateWorkspaceMutation.isPending,
  };
}
