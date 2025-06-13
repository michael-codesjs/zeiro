import { z } from 'zod';

// Schema for step 1 of signup form
export const signUpStep1Schema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters' })
    // .regex(/[0-9]/, { message: 'Password must contain at least one number' })
    // .regex(/[^a-zA-Z0-9]/, { message: 'Password must contain at least one special character' })
});

// Schema for step 2 of signup form
export const signUpStep2Schema = z.object({
  role: z.string().min(1, { message: 'Please select your role' }),
  usageIntent: z.string().min(1, { message: 'Please select how you plan to use Zeiro' })
});

// Combined schema for the entire signup form
export const signUpSchema = signUpStep1Schema.merge(signUpStep2Schema);

// Types derived from schemas
export type SignUpStep1FormData = z.infer<typeof signUpStep1Schema>;
export type SignUpStep2FormData = z.infer<typeof signUpStep2Schema>;
export type SignUpFormData = z.infer<typeof signUpSchema>; 