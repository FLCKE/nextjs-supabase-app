
import * as z from 'zod';

export const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  full_name: z.string().min(2, 'Full name must be at least 2 characters long'),
  role: z.enum(['owner', 'client'], {
    message: 'Please select whether you are a restaurant owner or client',
  }),
});
