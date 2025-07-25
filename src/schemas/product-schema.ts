import { z } from "zod"

export const productSchema = z.object({
  product_name: z.string().min(2, "Product name is required"),
  sku: z.string().min(1, "SKU is required"),
  branchId: z.string().min(1, "Branch is required"),
  unit: z.string().min(1, "Unit is required"),
  stock: z.coerce.number().min(0, { message: "Stock cannot be negative" }),
  brandId: z.string().min(1, "Brand must be selected"),
  categoryId: z.string().min(1, "Category must be selected"),
  tax: z.string(),
  sellingPriceTaxType: z.string(),
  excTax: z.coerce.number().min(0, "Exc. Tax is required"),
  incTax: z.coerce.number().min(0, "Inc. Tax is required"),
  margin: z.coerce.number().min(0, "Margin is required"),
  sellingPrice: z.coerce.number().min(0, "Selling Price is required"),
})

export const productUpdateSchema = productSchema.extend({
    id: z.string(),
})

export const getProductByList = z.object({
    id:z.string(),
})

export type ProductInput = z.infer<typeof productSchema>
