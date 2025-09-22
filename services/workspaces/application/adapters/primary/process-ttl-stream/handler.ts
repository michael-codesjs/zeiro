import { DynamoDBStreamEvent, DynamoDBRecord } from 'aws-lambda'
import { invitationReminders, invitationTokens, workspaces } from '@zeiro/domain'
import { EventBridgeAdapter } from '@adapters/secondary/event-bridge'
import { v4 as uuidv4 } from 'uuid'

// Initialize EventBridge adapter outside the handler for better performance
const eventBridgeAdapter = new EventBridgeAdapter()

interface InvitationReminderExpiredEvent {
  id: string
  source: string
  name: 'INVITATION_REMINDER_EXPIRED'
  payload: {
    reminder_id: string
    invitation_token: string
    workspace_id: string
    email: string
    reminder_type: string
    workspace_name?: string
  }
  date: Date
}

const handler = async (event: DynamoDBStreamEvent): Promise<void> => {
  console.log('Processing DynamoDB Stream event:', JSON.stringify(event, null, 2))

  for (const record of event.Records) {
    try {
      await processRecord(record)
    } catch (error) {
      console.error('Error processing record:', error, record)
      // Continue processing other records even if one fails
    }
  }
}

const processRecord = async (record: DynamoDBRecord): Promise<void> => {
  // Only process REMOVE events (TTL expiration)
  if (record.eventName !== 'REMOVE') {
    return
  }

  // Check if this is a TTL expiration by looking for the ttl attribute
  const oldImage = record.dynamodb?.OldImage
  if (!oldImage || !oldImage.ttl) {
    return
  }

  // Check if this is an InvitationReminder entity
  const entityType = oldImage.__edb_e__?.S
  if (entityType !== 'InvitationReminder') {
    return
  }

  // Extract reminder data from the old image
  const reminderId = oldImage.id?.S
  const invitationToken = oldImage.invitation_token?.S
  const workspaceId = oldImage.workspace_id?.S
  const email = oldImage.email?.S
  const reminderType = oldImage.reminder_type?.S
  const status = oldImage.status?.S

  if (!reminderId || !invitationToken || !workspaceId || !email || !reminderType) {
    console.log('Missing required fields in expired reminder record')
    return
  }

  // Only process pending reminders
  if (status !== 'pending') {
    console.log(`Skipping reminder ${reminderId} with status: ${status}`)
    return
  }

  console.log(`Processing expired reminder: ${reminderId} for invitation: ${invitationToken}`)

  // Check if the invitation token is still valid and pending
  const invitationResult = await invitationTokens.get({
    token: invitationToken
  }).go()

  const invitation = invitationResult.data
  if (!invitation || invitation.status !== 'pending') {
    console.log(`Invitation ${invitationToken} is no longer pending, skipping reminder`)
    return
  }

  // Get workspace details for the reminder
  const workspaceResult = await workspaces.get({
    workspace_id: workspaceId
  }).go()

  const workspace = workspaceResult.data
  if (!workspace || workspace.discontinued) {
    console.log(`Workspace ${workspaceId} not found or discontinued, skipping reminder`)
    return
  }

  // Publish reminder event for email service to process
  const reminderEvent: InvitationReminderExpiredEvent = {
    id: uuidv4(),
    source: 'zeiro.domain.workspaces.services.invitations',
    name: 'INVITATION_REMINDER_EXPIRED',
    payload: {
      reminder_id: reminderId,
      invitation_token: invitationToken,
      workspace_id: workspaceId,
      email: email,
      reminder_type: reminderType,
      workspace_name: workspace.name,
    },
    date: new Date(),
  }

  await eventBridgeAdapter.publish([reminderEvent])

  console.log(`Published reminder event for ${email} - ${reminderType}`)
}

/** 'processTtlStream' lambda function handler. */
export const main = handler
