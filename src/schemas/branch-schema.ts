import { z } from 'zod';

export const branchSchema = z.object({
  name: z.string().min(2),
});

export const updateBranchSchema = branchSchema.extend({
  id: z.string(),
});

export const deleteBranchSchema = z.object({
  id: z.string(),
});

export type BranchInput = z.infer<typeof branchSchema>;
