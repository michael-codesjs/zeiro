"use client";

import { useState, useEffect } from "react";
import { Button, ErrorState } from "@/components/ui";
import { useWorkspaces, type WorkspaceMember } from "@/data/workspaces";
import { useDisclosure } from "@/hooks/use-disclosure";
import { 
  Crown,
  Setting2,
} from "iconsax-reactjs";
import { InviteMemberModal, InviteMemberButton } from "./invite-member-modal";
import { EditWorkspaceModal, EditWorkspaceButton } from "./edit-workspace-modal";
import { WorkspaceSettingsSkeleton, MembersLoadingSkeleton } from "./skeleton-loaders";

type WorkspaceSettingsProps = {

}

export const WorkspaceSettings = ({}: WorkspaceSettingsProps) => {
  const { workspace, members, loading, error, fetchWorkspace } = useWorkspaces();

  // Modal disclosures
  const inviteMemberModalDisclosure = useDisclosure();
  const editWorkspaceModalDisclosure = useDisclosure();

  if (loading) {
    return <WorkspaceSettingsSkeleton />;
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load workspace"
        message={error}
        variant="compact"
        onRetry={fetchWorkspace}
        retryText="Retry"
      />
    );
  }

  // Since users cannot exist without a workspace, we should always have one
  if (!workspace) {
    return (
      <ErrorState
        title="Workspace Error"
        variant="compact"
        message="Unable to load your workspace."
        icon={<Setting2 size="24" className="text-red-500" />}
        onRetry={fetchWorkspace}
        retryText="Try Again"
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Workspace Header */}
      <div className="border-b border-gray-200 pb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            {/* Workspace Logo */}
            <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden shrink-0">
              {workspace.logo ? (
                <img 
                  src={workspace.logo} 
                  alt={`${workspace.name || 'Workspace'} logo`} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-900 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {workspace.name ? workspace.name.charAt(0).toUpperCase() : 'W'}
                  </span>
                </div>
              )}
            </div>
            
            {/* Workspace Info */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{workspace.name || 'Unnamed Workspace'}</h1>
              <p className="text-gray-600 mt-1 max-w-2xl">
                {workspace.description || "Workspace for team collaboration"}
              </p>
              <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                <span>{workspace.member_count || 0} members</span>
                {workspace.membership?.role && (
                  <>
                    <span>•</span>
                    <span className="capitalize">You're {workspace.membership.role}</span>
                  </>
                )}
                {workspace.created_at && (
                  <>
                    <span>•</span>
                    <span>Created {new Date(workspace.created_at).toLocaleDateString()}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <EditWorkspaceButton 
              workspace={workspace} 
              onOpen={editWorkspaceModalDisclosure.onOpen} 
            />
          </div>
        </div>
      </div>

      {/* Members Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Team Members</h2>
            <p className="text-sm text-gray-500 mt-1">{workspace.member_count || 0} people in this workspace</p>
          </div>
          <InviteMemberButton 
            workspace={workspace} 
            onOpen={inviteMemberModalDisclosure.onOpen} 
          />
        </div>
        
        <div className="space-y-3">
            {members.map((member) => (
              <div key={member.id} className="group bg-white border border-gray-200 rounded-lg px-6 py-5 hover:border-gray-300 hover:shadow-sm transition-all duration-150">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1 min-w-0">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                      <span className="text-lg font-semibold text-gray-700">
                        {member.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">{member.name}</h3>
                        {member.role === "owner" && (
                          <Crown size="16" className="text-gray-400 shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-gray-500 truncate mb-2">{member.email}</p>
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-400">
                        <span className="capitalize font-medium">{member.role}</span>
                        {member.joined_at ? (
                          <span>• Joined {new Date(member.joined_at).toLocaleDateString()}</span>
                        ) : (
                          <span>• Active member</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 shrink-0 ml-4">
                    {/* Future: Add member actions here */}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Modals */}
      <EditWorkspaceModal
        disclosure={editWorkspaceModalDisclosure}
        workspace={workspace}
      />
      
      <InviteMemberModal
        disclosure={inviteMemberModalDisclosure}
        workspaceId={workspace.id}
      />
      
    </div>
  );
}
