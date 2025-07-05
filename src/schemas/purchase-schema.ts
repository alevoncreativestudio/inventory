import { z } from "zod";

export const purchaseStatusEnum = z.enum(["Received", "Pending", "Cancelled"]);
export const paymentStatusEnum = z.enum(["Due", "Paid", "Partial"]);

export const purchaseSchema = z.object({
  referenceNo: z.string().min(1),
  date: z.coerce.date(), 
  location: z.string().min(1),
  supplier: z.string().min(1),
  purchaseStatus: purchaseStatusEnum,
  paymentStatus: paymentStatusEnum,
  grandTotal: z.coerce.number().min(0),
  paymentDue: z.coerce.number().min(0),
});

export const purchaseUpdateSchema = purchaseSchema.extend({
  id: z.string(),
});

export const getPurchaseByIdSchema = z.object({
  id: z.string(),
});
