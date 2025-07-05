import { z } from "zod"

export const categorySchema = z.object({
  name: z.string().min(2),
})

export const categoryUpdateSchema = categorySchema.extend({
  id: z.string(),
});

export const getCategoryById = z.object({
    id : z.string(),
})

export type CategoryInput = z.infer<typeof categorySchema>
