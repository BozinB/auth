import { z } from 'zod';

export const userSchema = z.object({
  client: z.string().min(3, { message: 'Client is required, must be at least 3 characters' }),
  username: z
    .string()
    .min(3, { message: 'Username must be at least 3 characters' })
    .max(30, { message: 'Username cannot exceed 30 characters' }),
  email: z
    .string()
    .email({ message: 'Invalid email format' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters' }),
  roles: z
    .array(z.enum(['super-admin', 'admin', 'user', 'editor']), { message: 'Roles must be a valid array' })
    .min(1, { message: 'Roles are required' }),
});
