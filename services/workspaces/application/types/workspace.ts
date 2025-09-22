export type WorkspaceRole = 'owner' | 'admin' | 'member' | 'guest'

export type MembershipStatus = 'active' | 'pending' | 'suspended'

export type Workspace = {
  id: string
  creator_id: string
  name: string
  description?: string
  created_at: string
  updated_at: string
  discontinued: boolean
  metadata?: Record<string, any>
}

export type WorkspaceMembership = {
  id: string
  workspace_id: string
  user_id: string
  role: WorkspaceRole
  status: MembershipStatus
  invited_by?: string
  invited_at?: string
  joined_at?: string
  created_at: string
  updated_at: string
  discontinued: boolean
  permissions?: Record<string, any>
  metadata?: Record<string, any>
}

export type WorkspaceWithMembership = Workspace & {
  membership: WorkspaceMembership
  member_count: number
}

export type WorkspaceMember = {
  id: string
  user_id: string
  name: string
  email: string
  role: WorkspaceRole
  status: MembershipStatus
  joined_at?: string
  invited_by?: string
}

export type CreateWorkspaceInput = {
  name: string
  description?: string
  metadata?: Record<string, any>
}

export type UpdateWorkspaceInput = {
  name?: string
  description?: string
  metadata?: Record<string, any>
}

export type InviteMemberInput = {
  email: string
  role: WorkspaceRole
  message?: string
}

export type WorkspaceListResponse = {
  workspaces: WorkspaceWithMembership[]
  total: number
}

export type WorkspaceMembersResponse = {
  members: WorkspaceMember[]
  total: number
  active_count: number
  pending_count: number
}

export type WorkspaceWithDetails = Workspace & {
  members: WorkspaceMember[]
  member_count: number
  membership: {
    role: string
    status: string
  }
}