"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { actionClient } from "@/lib/safeAction";
import {
  fullPurchaseSchema,
  getPurchaseByIdSchema,
  purchaseUpdateSchema,
} from "@/schemas/purchase-item-schema";
import { RawPurchaseItem, RawPurchasePayment } from "@/types/purchase";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";


const mapItemsWithRelation = (items: RawPurchaseItem[]) =>
  items.map((item) => ({
    product_name: item.product_name ?? "Unnamed",
    quantity: item.quantity,
    excTax: item.excTax,
    incTax:item.incTax,
    tax:item.tax,
    margin:item.margin,
    sellingPrice:item.sellingPrice,
    discount: item.discount,
    subtotal: item.subtotal,
    total: item.total,
    product: {
    connect: { id: item.productId },
    },
  }));

const mapPaymentsWithRelation = (payments: RawPurchasePayment[]) =>
  payments.map((payment) => ({
    amount: payment.amount,
    paidOn: payment.paidOn,
    paymentMethod: payment.paymentMethod,
    paymentNote: payment.paymentNote,
  }));


// CREATE PURCHASE
export const createPurchase = actionClient
  .inputSchema(fullPurchaseSchema)
  .action(async (values) => {
    try {      
      const { 
        items: rawItems,
        payments:rawPayments,
         ...purchaseData } = values.parsedInput;

      const items = mapItemsWithRelation(rawItems);
      const payments = mapPaymentsWithRelation(rawPayments);

      const totalAmount = rawItems.reduce((sum, item) => sum + (item.total || 0), 0);
      const paidAmount = rawPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
      const dueAmount = totalAmount - paidAmount;

      const totalPurchaseDue = dueAmount <= 0 ? 0 : dueAmount

      const purchase = await prisma.purchase.create({
        data: {
          ...purchaseData,
          totalAmount,
          dueAmount,
          items: {
            create: items,
          },
          payments:{
            create:payments
          }
        },
        include: {
          items: true,
          payments:true
        },
      });

      await Promise.all(
        rawItems.map(async (item) => {
          await prisma.product.update({
            where: { id: item.productId },
            data: {
              excTax: {
                set:item.excTax
              },
              incTax: {
                set:item.incTax
              },
              margin: {
                set:item.margin
              },
              sellingPrice: {
                set:item.sellingPrice
              },
              tax: {
                set:item.tax
              },
              stock: {
                increment: item.quantity,
              },
            },
          });
        })
      );

      await prisma.supplier.update({
          where: { id: purchase.supplierId },
          data: {
            openingBalance: {
              increment: dueAmount,
            },
            purchaseDue:{
              set:totalPurchaseDue
            }
          },
        });

      revalidatePath("/purchases");
      return { data: purchase };
    } catch (error) {
      console.error("Create Purchase Error:", error);
      return { error: "Something went wrong" };
    }
  });



// ✅ GET ALL PURCHASES
export const getPurchaseList = actionClient.action(async () => {
  try {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    const role = session?.user?.role
    const branchId = session?.user?.branch

    const whereClause = role === "admin" ? {} : {branchId}

    const purchases = await prisma.purchase.findMany({
      where : whereClause,
      orderBy: { purchaseDate: "desc" },
      include: { supplier: true, items: true, payments:true },
    });
    return { purchases };
  } catch (error) {
    console.error("Get Purchase List Error:", error);
    return { error: "Something went wrong" };
  }
});

// ✅ GET PURCHASE BY ID
export const getPurchaseById = actionClient
  .inputSchema(getPurchaseByIdSchema)
  .action(async (values) => {
    const { id } = values.parsedInput;
    if (!ObjectId.isValid(id)) {
      return { data: null };
    }

    const purchase = await prisma.purchase.findUnique({
      where: { id },
      include: { items: true, supplier: true },
    });

    return { data: purchase };
  });

// ✅ UPDATE PURCHASE
export const updatePurchase = actionClient
  .inputSchema(purchaseUpdateSchema)
  .action(async (values) => {
    const {
      id,
      items: rawItems,
      payments: rawPayments,
      ...data
    } = values.parsedInput;

    try {
      const totalAmount = rawItems.reduce(
        (sum, item) => sum + (item.total || 0),
        0
      );

      const oldItems = await prisma.purchaseItem.findMany({
        where: { purchaseId: id },
      });

      await Promise.all(
        oldItems.map((item) =>
          prisma.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          })
        )
      );

      await prisma.purchaseItem.deleteMany({
        where: { purchaseId: id },
      });

      await prisma.purchasePayment.deleteMany({
        where: { purchaseId: id },
      });

      const items = mapItemsWithRelation(rawItems);
      const payments = mapPaymentsWithRelation(rawPayments ?? []);

      const purchase = await prisma.purchase.update({
        where: { id },
        data: {
          ...data,
          totalAmount,
          items: {
            create: items,
          },
          payments: {
            create: payments,
          },
        },
        include: {
          items: true,
          payments: true,
        },
      });

      await Promise.all(
        rawItems.map((item) =>
          prisma.product.update({
            where: { id: item.productId },
            data: {
              excTax: {
                set:item.excTax
              },
              incTax: {
                set:item.incTax
              },
              margin: {
                set:item.margin
              },
              sellingPrice: {
                set:item.sellingPrice
              },
              tax: {
                set:item.tax
              },
              stock: {
                increment: item.quantity,
              },
            },
          })
        )
      );

      revalidatePath("/purchases");
      return { data: purchase };
    } catch (error) {
      console.error("Update Purchase Error:", error);
      return { error: "Something went wrong" };
    }
  });



// DELETE PURCHASE
export const deletePurchase = actionClient
.inputSchema(getPurchaseByIdSchema)
.action(async (values) => {
  const { id } = values.parsedInput;

  if (!ObjectId.isValid(id)) {
    return null;
  }

  await prisma.purchaseItem.deleteMany({
    where: { purchaseId: id },
  });

  await prisma.purchasePayment.deleteMany({
    where: { purchaseId: id },
  });

  return await prisma.purchase.delete({
    where: { id },
  });
});

