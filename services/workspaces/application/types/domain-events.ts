import { DomainEvent } from '@zeiro/sdk'
import { Workspace, WorkspaceMembership, WorkspaceRole } from './workspace'

export type WORKSPACE_CREATED_DOMAIN_EVENT = DomainEvent<
  'zeiro.domain.workspaces.services.workspace',
  'WORKSPACE_CREATED',
  Workspace
>

export type WORKSPACE_UPDATED_DOMAIN_EVENT = DomainEvent<
  'zeiro.domain.workspaces.services.workspace',
  'WORKSPACE_UPDATED',
  {
    workspace_id: string
    name?: string
    description?: string
    metadata?: Record<string, any>
    updated_by: string
  }
>

export type WORKSPACE_DELETED_DOMAIN_EVENT = DomainEvent<
  'zeiro.domain.workspaces.services.workspace',
  'WORKSPACE_DELETED',
  {
    workspace_id: string
    deleted_by: string
  }
>

export type MEMBER_INVITED_DOMAIN_EVENT = DomainEvent<
  'zeiro.domain.workspaces.services.membership',
  'MEMBER_INVITED',
  {
    workspace_id: string
    email: string
    role: WorkspaceRole
    invited_by: string
    membership_id: string
  }
>

export type MEMBER_JOINED_DOMAIN_EVENT = DomainEvent<
  'zeiro.domain.workspaces.services.membership',
  'MEMBER_JOINED',
  WorkspaceMembership
>

export type MEMBER_ROLE_UPDATED_DOMAIN_EVENT = DomainEvent<
  'zeiro.domain.workspaces.services.membership',
  'MEMBER_ROLE_UPDATED',
  {
    workspace_id: string
    user_id: string
    old_role: WorkspaceRole
    new_role: WorkspaceRole
    updated_by: string
  }
>

export type MEMBER_REMOVED_DOMAIN_EVENT = DomainEvent<
  'zeiro.domain.workspaces.services.membership',
  'MEMBER_REMOVED',
  {
    workspace_id: string
    user_id: string
    removed_by: string
  }
>

export type MEMBER_LEFT_DOMAIN_EVENT = DomainEvent<
  'zeiro.domain.workspaces.services.membership',
  'MEMBER_LEFT',
  {
    workspace_id: string
    user_id: string
  }
>