"use server";

import { prisma } from "@/lib/prisma";
import { actionClient } from "@/lib/safeAction";
import { balancePaymentSchema, getBalancePaymentsSchema } from "@/schemas/balance-payment-schema";
import { revalidatePath } from "next/cache";


export const createBalancePayment = actionClient
  .inputSchema(balancePaymentSchema)
  .action(async (values) => {
    try {
      const payment = await prisma.balancePayment.create({
        data: values.parsedInput,
      });

      const amount = payment.amount;

      // --- Supplier Payment Handling ---
      if (payment.supplierId) {
        await prisma.supplier.update({
          where: { id: payment.supplierId },
          data: {
            openingBalance: { decrement: amount },
            purchaseDue: { decrement: amount },
          },
        });

        const purchases = await prisma.purchase.findMany({
          where: {
            supplierId: payment.supplierId,
            dueAmount: { gt: 0 },
          },
          orderBy: { createdAt: "asc" },
        });

        let purchaseRemaining = amount;

        for (const purchase of purchases) {
          if (purchaseRemaining <= 0) break;

          const deduction = Math.min(purchase.dueAmount, purchaseRemaining);

          await prisma.purchase.update({
            where: { id: purchase.id },
            data: {
              dueAmount: {
                decrement: deduction,
              },
              paidAmount:{
                increment:deduction
              }
            },
          });

          purchaseRemaining -= deduction;
        }
      }

      // --- Customer Payment Handling ---
      if (payment.customerId) {
        await prisma.customer.update({
          where: { id: payment.customerId },
          data: {
            openingBalance: { increment: amount },
            salesDue: { decrement: amount },
          },
        });

        const sales = await prisma.sale.findMany({
          where: {
            customerId: payment.customerId,
            dueAmount: { gt: 0 },
          },
          orderBy: { createdAt: "asc" },
        });

        let salesRemaining = amount;

        for (const sale of sales) {
          if (salesRemaining <= 0) break;

          const deduction = Math.min(sale.dueAmount, salesRemaining);

          await prisma.sale.update({
            where: { id: sale.id },
            data: {
              dueAmount: {
                decrement: deduction,
              },
              paidAmount:{
                increment:deduction,
              }
            },
          });

          salesRemaining -= deduction;
        }
      }

      // Revalidate
      if (payment.customerId) {
        revalidatePath("/customers");
      } else if (payment.supplierId) {
        revalidatePath("/suppliers");
      }

      return { data: payment };
    } catch (error) {
      console.error("Create Balance Payment Error:", error);
      return { error: "Something went wrong" };
    }
  });


export const getBalancePayments = actionClient
  .inputSchema(getBalancePaymentsSchema)
  .action(async ({ parsedInput }) => {
    const { customerId,supplierId} = parsedInput;

    try {
      const payments = await prisma.balancePayment.findMany({
        where: {
          customerId: customerId ?? undefined,
          supplierId: supplierId ?? undefined,
        },
        orderBy: { paidOn: "desc" },
      });
      return { data: payments };
    } catch (error) {
      console.error("Get Balance Payments Error:", error);
      return { error: "Failed to fetch payments" };
    }
  });

  
