import { z } from "zod";

export const purchaseReturnSchema = z.object({
  referenceNo: z.string().min(1, "Reference No is required"),
  supplierId: z.string().min(1, "Supplier is required"),
  returnDate: z.coerce.date(),
  totalAmount: z.coerce.number().min(0, "Total amount is required"),
});


