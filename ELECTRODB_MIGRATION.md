# ElectroDB Migration Guide

## What Changed

We've migrated from OneTable to ElectroDB for better TypeScript support and cleaner query patterns.

### Key Benefits of ElectroDB

1. **Better TypeScript Support**: Strong type inference for entities and queries
2. **Cleaner Query API**: More intuitive query building
3. **Built-in GSI Support**: Easier to work with Global Secondary Indexes
4. **Service Pattern**: Combine multiple entities for cross-entity queries

## New Structure

### Entity Definition Example (User)

```typescript
// shared/domain/src/entities/user.entity.ts
import { Entity } from 'electrodb'

export const UserEntity = new Entity({
  model: {
    entity: 'User',
    version: '1',
    service: 'zeiro',
  },
  attributes: {
    id: { type: 'string', required: true },
    workspace_id: { type: 'string', required: true },
    cognito_user_id: { type: 'string', required: true },
    // ... other attributes
  },
  indexes: {
    byWorkspace: {
      pk: {
        field: 'PK',
        composite: ['workspace_id'],
        template: 'WORKSPACE#${workspace_id}',
      },
      sk: {
        field: 'SK',
        composite: ['id'],
        template: 'USER#${id}',
      },
    },
    byCognitoUser: {
      index: 'GSI1',
      pk: {
        field: 'GSI1_PK',
        composite: ['cognito_user_id'],
        template: 'COGNITO_USER#${cognito_user_id}',
      },
      sk: {
        field: 'GSI1_SK',
        composite: ['cognito_user_id'],
        template: 'COGNITO_USER#${cognito_user_id}',
      },
    },
  },
})
```

### Service Definition

```typescript
// shared/domain/src/electrodb-service.ts
import { Service } from 'electrodb'

export const ZeiroService = new Service({
  user: UserEntity,
  workspace: WorkspaceEntity,
  workspaceMembership: WorkspaceMembershipEntity,
})

// Export for convenience
export const users = ZeiroService.entities.user
export const workspaces = ZeiroService.entities.workspace
export const workspaceMemberships = ZeiroService.entities.workspaceMembership
```

## Common Query Patterns

### 1. Get User by Cognito ID (GSI Query)

```typescript
// Query using the byCognitoUser index
const result = await users.query
  .byCognitoUser({ cognito_user_id })
  .go()

const user = result.data?.[0]
```

### 2. Get Item by Primary Key

```typescript
// Get workspace membership
const membership = await workspaceMemberships.get({
  workspace_id: 'workspace-123',
  user_id: 'user-456'
}).go()
```

### 3. Query by Partition Key

```typescript
// Get all memberships for a workspace
const memberships = await workspaceMemberships.query
  .byWorkspace({ workspace_id: 'workspace-123' })
  .go()
```

### 4. Create New Item

```typescript
const newUser = await users.create({
  id: uuidv4(),
  workspace_id: 'workspace-123',
  cognito_user_id: 'cognito-456',
  name: 'John Doe',
  email: 'john@example.com',
}).go()
```

### 5. Update Item

```typescript
const updated = await users.update({
  id: 'user-123',
  workspace_id: 'workspace-456',
})
  .set({ name: 'Jane Doe' })
  .go()
```

### 6. Delete Item

```typescript
await users.delete({
  id: 'user-123',
  workspace_id: 'workspace-456',
}).go()
```

### 7. Batch Operations

```typescript
// Batch get multiple users
const results = await users.get([
  { id: 'user-1', workspace_id: 'ws-1' },
  { id: 'user-2', workspace_id: 'ws-1' },
]).go()
```

### 8. Complex Queries with Filters

```typescript
// Query with additional filters
const activeUsers = await workspaceMemberships.query
  .byWorkspace({ workspace_id: 'workspace-123' })
  .where(({ status }, { eq }) => eq(status, 'active'))
  .go()
```

### 9. Cross-Entity Queries (Collections)

```typescript
// Query across entities using the service
const results = await ZeiroService.collections
  .workspaceData({ workspace_id: 'workspace-123' })
  .go()
```

## Migration Checklist

- [x] Install ElectroDB (`yarn add electrodb`)
- [x] Create entity definitions for User, Workspace, WorkspaceMembership
- [x] Create service combining all entities
- [x] Update domain package exports
- [x] Update get-user handler to use ElectroDB
- [ ] Update remaining handlers
- [ ] Test all endpoints
- [ ] Remove OneTable dependencies

## Key Differences from OneTable

1. **No `encode` mappings needed** - ElectroDB handles key generation via templates
2. **Query syntax** - Use `.query.indexName()` instead of `.find()` with index option
3. **Get operations** - Always end with `.go()` to execute
4. **Attributes** - Use `readOnly`, `default`, and `watch` for computed fields
5. **Type safety** - Better TypeScript inference out of the box

## Testing

After migrating, test each endpoint:

```bash
# Test get user
curl -X GET https://api.usezeiro.com/user/me \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test create user (triggered by Cognito)
# Test workspace operations
# Test membership operations
```

## Troubleshooting

### Common Issues

1. **Missing .go()** - ElectroDB queries must end with `.go()` to execute
2. **Index not found** - Ensure index names match exactly (case-sensitive)
3. **Type errors** - ElectroDB has stricter typing, which is good for catching bugs

### Debug Tips

```typescript
// Enable query logging
const result = await users.query
  .byCognitoUser({ cognito_user_id })
  .go({ logParams: true })
```

## References

- [ElectroDB Documentation](https://electrodb.dev)
- [ElectroDB GitHub](https://github.com/tywalch/electrodb)
- [Migration from OneTable Guide](https://electrodb.dev/en/migration/)
