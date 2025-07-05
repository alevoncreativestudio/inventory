import { z } from "zod"

export const productSchema = z.object({
  product_name: z.string().min(2, "Product name is required"),
  quantity: z.coerce.number().min(0),
  price: z.coerce.number().min(0),
  brandId: z.string().min(1, "Brand must be selected"),
  categoryId: z.string().min(1, "Category must be selected"),
})

export const productUpdateSchema = productSchema.extend({
    id: z.string(),
})

export const getProductByList = z.object({
    id:z.string(),
})

export type ProductInput = z.infer<typeof productSchema>
