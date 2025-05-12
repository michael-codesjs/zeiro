import { Model } from 'dynamodb-onetable'
import { users_table } from './table'
import { User } from '@typings/user'

// Define the event model
export const users = new Model<User>(
  users_table,
  'User',
  {
    fields: {
      id: { type: String, required: true },
      entity_type: { type: String },
      creator: { type: String },
      creator_type: { type: String },
      created: { type: Date },
      modified: { type: Date },
      discontinued: { type: Boolean },
      email: { type: String },
      email_verified: { type: Boolean },
      password: { type: String },
    },
  },
)
