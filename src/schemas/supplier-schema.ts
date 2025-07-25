import { z } from 'zod';

export const supplierSchema = z.object({
  SupplierId:z.string().min(2),
  branchId: z.string().min(1, "Branch is required"),
  name: z.string().min(2, "Supplier name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(7, "Phone number is required"),
  openingBalance: z.coerce.number().optional(),
  address: z.string().min(1),
  purchaseDue:z.coerce.number().optional(),
  purchaseReturnDue:z.coerce.number().optional()
});

export const updateSupplierSchema = supplierSchema.extend({
  id: z.string(),
});

export const deleteSupplierSchema = z.object({
  id: z.string(),
});

export type SupplierInput = z.infer<typeof supplierSchema>;
