# Workspace Invitation Flow

This document describes how the unique invitation link system works for workspace invitations.

## Overview

When a workspace admin invites a new member, the system generates a unique, secure invitation link that the invitee can use to sign up and automatically join the workspace.

## Flow

### 1. Inviting a Member

When an admin invites a member via `POST /workspaces/{workspaceId}/members/invite`:

```json
{
  "email": "user@example.com",
  "role": "member",
  "message": "Welcome to our workspace!"
}
```

The system:
- Creates a pending workspace membership
- Generates a unique invitation token (32 random bytes, base64url encoded)
- Sets an expiration date (7 days from creation)
- Returns an invitation URL

Response includes:
```json
{
  "id": "membership-id",
  "workspace_id": "workspace-id",
  "user_id": "EMAIL:user@example.com",
  "role": "member",
  "status": "pending",
  "invitation_url": "https://usezeiro.com/auth/signup?invitation=TOKEN&workspace=WORKSPACE_ID",
  "invitation_token": "TOKEN_FOR_DEBUGGING"
}
```

### 2. Validating an Invitation (Optional)

The frontend can validate an invitation before showing the signup form via `GET /invitations/{token}/validate`:

Response for valid invitation:
```json
{
  "valid": true,
  "workspace": {
    "id": "workspace-id",
    "name": "My Workspace",
    "description": "A great workspace"
  },
  "invitation": {
    "email": "user@example.com",
    "role": "member",
    "invited_by": "inviter-user-id",
    "invited_at": "2023-01-01T00:00:00Z",
    "expires_at": "2023-01-08T00:00:00Z"
  }
}
```

### 3. Sign Up with Invitation

When the user signs up, the frontend should:

1. Include the invitation token as a custom attribute in the Cognito sign-up call:
```javascript
await Auth.signUp({
  username: email,
  password: password,
  attributes: {
    email: email,
    name: name,
    'custom:invitation_token': invitationToken
  }
})
```

2. After Cognito confirmation, the system automatically:
   - Creates the user record
   - Accepts the invitation
   - Activates the workspace membership
   - Publishes a MEMBER_JOINED event

### 4. Manual Invitation Acceptance (Alternative)

If not using Cognito custom attributes, the frontend can manually accept invitations via `POST /invitations/accept`:

```json
{
  "invitation_token": "TOKEN",
  "cognito_user_id": "cognito-user-id",
  "user_email": "user@example.com"
}
```

## Frontend Implementation Example

### Sign Up Page with Invitation

```typescript
// pages/auth/signup.tsx
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'

export default function SignUpPage() {
  const router = useRouter()
  const { invitation, workspace } = router.query
  const [invitationData, setInvitationData] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (invitation) {
      validateInvitation(invitation as string)
    }
  }, [invitation])

  const validateInvitation = async (token: string) => {
    try {
      const response = await fetch(`/api/invitations/${token}/validate`)
      if (response.ok) {
        const data = await response.json()
        setInvitationData(data)
      }
    } catch (error) {
      console.error('Failed to validate invitation:', error)
    }
  }

  const handleSignUp = async (formData: SignUpFormData) => {
    setLoading(true)
    try {
      const signUpParams = {
        username: formData.email,
        password: formData.password,
        attributes: {
          email: formData.email,
          name: formData.name,
        }
      }

      // Add invitation token if present
      if (invitation) {
        signUpParams.attributes['custom:invitation_token'] = invitation as string
      }

      await Auth.signUp(signUpParams)
      
      // Redirect to confirmation or dashboard
      router.push('/auth/confirm')
    } catch (error) {
      console.error('Sign up failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {invitationData && (
        <div className="invitation-banner">
          <h2>You've been invited to join {invitationData.workspace.name}</h2>
          <p>Role: {invitationData.invitation.role}</p>
          <p>Invited by: {invitationData.invitation.invited_by}</p>
        </div>
      )}
      
      <SignUpForm onSubmit={handleSignUp} loading={loading} />
    </div>
  )
}
```

## Security Considerations

1. **Token Security**: Invitation tokens are 32 random bytes, making them cryptographically secure
2. **Expiration**: Tokens expire after 7 days
3. **Single Use**: Tokens are removed after successful acceptance
4. **Email Verification**: The system verifies the email matches the invitation
5. **Workspace Validation**: Ensures the workspace still exists and is active

## API Endpoints

- `POST /workspaces/{workspaceId}/members/invite` - Create invitation
- `GET /invitations/{token}/validate` - Validate invitation token
- `POST /invitations/accept` - Accept invitation (manual)

## Automated Reminder System

The system automatically schedules reminder emails using DynamoDB TTL:

### Reminder Schedule
- **Day 3**: First reminder sent
- **Day 6**: Second reminder sent  
- **Day 7**: Final reminder sent (invitation expires)

### TTL-Based Processing
1. **InvitationReminder** records are created with TTL timestamps
2. **DynamoDB TTL** automatically expires records at scheduled times
3. **DynamoDB Streams** capture TTL expiration events
4. **Lambda function** processes expired reminders and publishes events
5. **Email service** receives events and sends reminder emails

### Stream Processing
The `processTtlStream` Lambda function:
- Listens to DynamoDB stream events
- Filters for `REMOVE` events on `InvitationReminder` entities
- Validates invitation is still pending
- Publishes `INVITATION_REMINDER_EXPIRED` events
- Email service handles the actual email sending

### Event Schema
```json
{
  "id": "event-id",
  "source": "zeiro.domain.workspaces.services.invitations",
  "name": "INVITATION_REMINDER_EXPIRED",
  "payload": {
    "reminder_id": "reminder-id",
    "invitation_token": "token",
    "workspace_id": "workspace-id",
    "email": "user@example.com",
    "reminder_type": "first_reminder|second_reminder|final_reminder",
    "workspace_name": "My Workspace"
  },
  "date": "2023-01-01T12:00:00Z"
}
```

## Environment Variables

- `MARKETING_URL` - Base URL for generating invitation links (defaults to https://usezeiro.com)
- `ACCEPT_INVITATION_URL` - URL for the accept invitation endpoint (used by Cognito post-confirmation)

## Database Schema

### InvitationToken Entity
Stores invitation tokens with proper indexing and TTL:

```json
{
  "token": "secure-base64url-token",
  "workspace_id": "workspace-id",
  "membership_id": "membership-id",
  "email": "user@example.com",
  "role": "member",
  "invited_by": "inviter-user-id",
  "status": "pending|accepted|expired|revoked",
  "expires_at": 1672531200, // Unix timestamp for TTL
  "invitation_message": "Welcome!",
  "accepted_at": "2023-01-01T12:00:00Z", // ISO string when accepted
  "accepted_by_cognito_user_id": "cognito-user-id",
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-01-01T00:00:00Z"
}
```

### InvitationReminder Entity
Manages automated reminder scheduling with TTL:

```json
{
  "id": "reminder-id",
  "invitation_token": "invitation-token",
  "workspace_id": "workspace-id",
  "membership_id": "membership-id",
  "email": "user@example.com",
  "invited_by": "inviter-user-id",
  "reminder_type": "first_reminder|second_reminder|final_reminder",
  "reminder_count": 0,
  "status": "pending|sent|cancelled",
  "scheduled_for": 1672531200, // Unix timestamp when reminder should be sent
  "ttl": 1672617600, // Unix timestamp for DynamoDB TTL (1 day after scheduled)
  "sent_at": "2023-01-01T12:00:00Z", // ISO string when sent
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-01-01T00:00:00Z"
}
```

### Workspace Membership
The membership record is simplified and no longer stores invitation metadata:

```json
{
  "id": "membership-id",
  "workspace_id": "workspace-id",
  "user_id": "EMAIL:user@example.com", // Placeholder until accepted
  "role": "member",
  "status": "pending|active|suspended",
  "invited_by": "inviter-user-id",
  "invited_at": "2023-01-01T00:00:00Z",
  "joined_at": "2023-01-01T12:00:00Z", // When invitation was accepted
  "metadata": {
    "email": "user@example.com",
    "invitation_message": "Welcome!"
  }
}
```
