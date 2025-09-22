import { invitationTokens, invitationReminders } from '@zeiro/domain'

/**
 * Utility functions for managing invitations and reminders
 */

export interface InvitationSummary {
  token: string
  email: string
  workspace_id: string
  role: string
  status: string
  expires_at: number
  created_at: string
  pending_reminders: number
  sent_reminders: number
}

/**
 * Get all pending invitations for a workspace
 */
export const getPendingInvitations = async (workspace_id: string): Promise<InvitationSummary[]> => {
  const invitations = await invitationTokens.query
    .byWorkspace({ workspace_id })
    .where(({ status }, { eq }) => eq(status, 'pending'))
    .go()

  const summaries: InvitationSummary[] = []

  for (const invitation of invitations.data) {
    // Get reminder counts for this invitation
    const reminders = await invitationReminders.query
      .byToken({ invitation_token: invitation.token })
      .go()

    const pendingReminders = reminders.data.filter(r => r.status === 'pending').length
    const sentReminders = reminders.data.filter(r => r.status === 'sent').length

    summaries.push({
      token: invitation.token,
      email: invitation.email,
      workspace_id: invitation.workspace_id,
      role: invitation.role,
      status: invitation.status,
      expires_at: invitation.expires_at,
      created_at: invitation.created_at,
      pending_reminders: pendingReminders,
      sent_reminders: sentReminders,
    })
  }

  return summaries
}

/**
 * Revoke an invitation token and cancel all pending reminders
 */
export const revokeInvitation = async (token: string): Promise<void> => {
  // Update invitation status
  await invitationTokens.update({ token }).set({
    status: 'revoked',
  }).go()

  // Cancel all pending reminders
  const pendingReminders = await invitationReminders.query
    .byToken({ invitation_token: token })
    .where(({ status }, { eq }) => eq(status, 'pending'))
    .go()

  for (const reminder of pendingReminders.data) {
    await invitationReminders.update({
      id: reminder.id
    }).set({
      status: 'cancelled',
    }).go()
  }
}

/**
 * Get invitation statistics for a workspace
 */
export const getInvitationStats = async (workspace_id: string) => {
  const allInvitations = await invitationTokens.query
    .byWorkspace({ workspace_id })
    .go()

  const stats = {
    total: allInvitations.data.length,
    pending: 0,
    accepted: 0,
    expired: 0,
    revoked: 0,
  }

  const currentTimestamp = Math.floor(Date.now() / 1000)

  for (const invitation of allInvitations.data) {
    if (invitation.status === 'pending' && invitation.expires_at < currentTimestamp) {
      stats.expired++
    } else {
      stats[invitation.status as keyof typeof stats]++
    }
  }

  return stats
}

/**
 * Clean up expired invitations (mark as expired)
 */
export const cleanupExpiredInvitations = async (workspace_id: string): Promise<number> => {
  const pendingInvitations = await invitationTokens.query
    .byWorkspace({ workspace_id })
    .where(({ status }, { eq }) => eq(status, 'pending'))
    .go()

  const currentTimestamp = Math.floor(Date.now() / 1000)
  let cleanedCount = 0

  for (const invitation of pendingInvitations.data) {
    if (invitation.expires_at < currentTimestamp) {
      await invitationTokens.update({
        token: invitation.token
      }).set({
        status: 'expired',
      }).go()

      // Cancel pending reminders
      const pendingReminders = await invitationReminders.query
        .byToken({ invitation_token: invitation.token })
        .where(({ status }, { eq }) => eq(status, 'pending'))
        .go()

      for (const reminder of pendingReminders.data) {
        await invitationReminders.update({
          id: reminder.id
        }).set({
          status: 'cancelled',
        }).go()
      }

      cleanedCount++
    }
  }

  return cleanedCount
}
