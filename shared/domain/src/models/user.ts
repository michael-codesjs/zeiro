
export const User = {
    pk: { type: String, value: 'USER#${id}', hidden: true },
    sk: { type: String, value: 'USER#${id}#${discontinued}', hidden: true },
    id: { type: String, required: true },
    entity_type: { type: String, value: 'USER' },
    creator_id: { type: String, value: '${id}' },
    creator_type: { type: String, value: 'USER' },
    created_at: { type: Date },
    updated_at: { type: Date },
    discontinued: { type: Boolean, default: false },
    cognito_user_id: { type: String },
    name: { type: String, required: true },
    email: { type: String, required: true },
    email_verified: { type: Boolean },
    password: { type: String },
} as const