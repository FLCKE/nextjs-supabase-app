
import * as z from 'zod';

export const profileSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters long'),
  phone: z.string().optional(),
});
