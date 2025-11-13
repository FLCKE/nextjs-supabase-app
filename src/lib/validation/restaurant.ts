
import * as z from 'zod';

export const restaurantSchema = z.object({
  name: z.string().min(2, 'Restaurant name must be at least 2 characters'),
  legal_name: z.string().min(2, 'Legal name must be at least 2 characters'),
  country: z.string().min(2, 'Country is required'),
  currency: z.string().min(3, 'Currency code is required').max(3, 'Currency must be 3 characters'),
});

export const locationSchema = z.object({
  name: z.string().min(2, 'Location name must be at least 2 characters'),
  timezone: z.string().min(1, 'Timezone is required'),
});

export const tableSchema = z.object({
  label: z.string().min(1, 'Table label is required'),
  active: z.boolean(),
});
