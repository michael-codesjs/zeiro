
export const User = {
    pk: { type: String, value: 'USER#${id}', hidden: true },
    sk: { type: String, value: 'USER#${id}#${discontinue}', hidden: true },
    id: { type: String, required: true },
    entity_type: { type: String, value: 'USER' },
    creator_id: { type: String, value: '${id}' },
    creator_type: { type: String, value: 'USER' },
    created_at: { type: Date },
    updated_at: { type: Date },
    discontinued: { type: Boolean, hidden: true },
    cognito_user_id: { type: String },
    name: { type: String, required: true },
    email: { type: String, required: true },
    email_verified: { type: Boolean },
    password: { type: String },
} as const