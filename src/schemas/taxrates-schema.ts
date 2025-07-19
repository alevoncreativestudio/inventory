import { z } from 'zod';

export const taxrateSchema = z.object({
  name: z.string().min(2),
  taxRate:z.string()
})

export const updatetaxrateSchema = taxrateSchema.extend({
  id: z.string(),
});

export const deletetaxrateSchema = z.object({
  id: z.string(),
});

export type TaxRateInput = z.infer<typeof taxrateSchema>;
