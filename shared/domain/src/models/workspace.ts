export const Workspace = {
        pk: { type: String, value: '${creator_type}#${creator_id}', hidden: true },
        sk: { type: String, value: '${entity_type}#${id}', hidden: true },
        id: { type: String, required: true },
        entity_type: { type: String, value: 'WORKSPACE' },
        creator_id: { type: String, required: true },
        creator_type: { type: String, value: 'USER' },
        created_at: { type: Date },
        updated_at: { type: Date },
        discontinued: { type: Boolean },
        name: { type: String },
        description: { type: String },
        metadata: { type: Object },
} as const