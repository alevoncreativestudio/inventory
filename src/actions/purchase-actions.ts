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
import { z } from "zod";
import { purchaseStatusEnum } from "@/schemas/purchase-schema";


const mapItemsWithRelation = (items: RawPurchaseItem[]) =>
  items.map((item) => ({
    product_name: item.product_name ?? "Unnamed",
    quantity: item.quantity,
    excTax: item.excTax,
    incTax: item.incTax,
    tax: item.tax,
    margin: item.margin,
    sellingPrice: item.sellingPrice,
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
    dueDate: payment.dueDate
  }));


// CREATE PURCHASE
export const createPurchase = actionClient
  .inputSchema(fullPurchaseSchema)
  .action(async (values) => {
    try {
      const {
        items: rawItems,
        payments: rawPayments,
        ...purchaseData } = values.parsedInput;

      const items = mapItemsWithRelation(rawItems);
      const payments = mapPaymentsWithRelation(rawPayments);

      const totalAmount = rawItems.reduce((sum, item) => sum + (item.total || 0), 0);
      const paidAmount = rawPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
      const dueAmount = totalAmount - paidAmount;

      const totalPurchaseDue = dueAmount <= 0 ? 0 : dueAmount

      console.log("Purchase calculation:", {
        totalAmount,
        paidAmount,
        dueAmount,
        totalPurchaseDue,
        status: purchaseData.status
      });

      const purchase = await prisma.purchase.create({
        data: {
          ...purchaseData,
          totalAmount,
          dueAmount,
          items: {
            create: items,
          },
          payments: {
            create: payments
          }
        },
        include: {
          items: true,
          payments: true
        },
      });

      // Only update stock and supplier balance when status is "Received"
      if (purchaseData.status === "Received") {
        await Promise.all(
          rawItems.map(async (item) => {
            await prisma.product.update({
              where: { id: item.productId },
              data: {
                excTax: {
                  set: Math.round(item.excTax)
                },
                incTax: {
                  set: Math.round(item.incTax)
                },
                margin: {
                  set: item.margin
                },
                sellingPrice: {
                  set: Math.round(item.sellingPrice)
                },
                tax: {
                  set: item.tax
                },
                stock: {
                  increment: item.quantity,
                },
              },
            });
          })
        );

        console.log("Updating supplier opening balance:", {
          supplierId: purchase.supplierId,
          totalPurchaseDue,
          status: purchaseData.status
        });

        // Check if supplier exists
        const supplier = await prisma.supplier.findUnique({
          where: { id: purchase.supplierId }
        });

        if (!supplier) {
          console.error("Supplier not found:", purchase.supplierId);
          throw new Error("Supplier not found");
        }

        console.log("Current supplier opening balance:", supplier.openingBalance);

        await prisma.supplier.update({
          where: { id: purchase.supplierId },
          data: {
            purchaseDue: {
              increment: totalPurchaseDue
            },
            openingBalance: {
              increment: totalPurchaseDue
            }
          },
        });

        console.log("Supplier opening balance updated successfully");
      }

      revalidatePath("/purchases");
      return { data: purchase };
    } catch (error) {
      console.error("Create Purchase Error:", error);
      return { error: "Something went wrong" };
    }
  });



// ✅ GET ALL PURCHASES
export const getPurchaseList = actionClient
  .inputSchema(
    z.object({
      page: z.number().default(1),
      limit: z.number().default(10),
    })
  )
  .action(async (values) => {
    try {
      const { page, limit } = values.parsedInput;
      const skip = (page - 1) * limit;

      const session = await auth.api.getSession({
        headers: await headers()
      });

      const role = session?.user?.role
      const branchId = session?.user?.branch

      const whereClause = role === "admin" ? {} : { branchId }

      const [purchases, totalCount, totals] = await Promise.all([
        prisma.purchase.findMany({
          where: whereClause,
          orderBy: { purchaseDate: "desc" },
          take: limit,
          skip: skip,
          include: {
            supplier: true,
            items: {
              include: {
                product: true
              }
            },
            payments: true,
            branch: true
          },
        }),
        prisma.purchase.count({ where: whereClause }),
        prisma.purchase.aggregate({
          where: whereClause,
          _sum: {
            totalAmount: true,
            dueAmount: true,
            paidAmount: true,
          },
        }),
      ]);

      const totalPages = Math.ceil(totalCount / limit);

      return {
        purchases,
        metadata: {
          totalPages,
          totalCount,
          currentPage: page,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
        totals: {
          totalAmount: totals._sum.totalAmount || 0,
          dueAmount: totals._sum.dueAmount || 0,
          paidAmount: totals._sum.paidAmount || 0,
        }
      };

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
      include: {
        supplier: true,
        branch: true,
        items: { include: { product: true } },
        payments: true,
      },
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

      // Get the current purchase to check its status
      const currentPurchase = await prisma.purchase.findUnique({
        where: { id },
        include: { items: true }
      });

      // Calculate old due amount for opening balance reversal
      const oldDueAmount = currentPurchase?.dueAmount || 0;

      // Only reverse stock if the current purchase was "Received"
      if (currentPurchase?.status === "Received") {
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

        // Reverse opening balance if it was previously "Received"
        // But only if the new status is NOT "Cancelled" (to avoid double subtraction)
        if (oldDueAmount > 0 && data.status !== "Cancelled") {
          console.log("Reversing supplier opening balance:", {
            supplierId: currentPurchase.supplierId,
            oldDueAmount,
            previousStatus: currentPurchase.status,
            newStatus: data.status
          });

          await prisma.supplier.update({
            where: { id: currentPurchase.supplierId },
            data: {
              openingBalance: {
                decrement: oldDueAmount
              }
            },
          });

          console.log("Supplier opening balance reversed");
        }
      }

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

      // Calculate new due amount
      const paidAmount = rawPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
      const newDueAmount = totalAmount - paidAmount;
      const finalDueAmount = newDueAmount <= 0 ? 0 : newDueAmount;

      console.log("Update purchase calculation:", {
        totalAmount,
        paidAmount,
        newDueAmount,
        finalDueAmount,
        status: data.status,
        oldStatus: currentPurchase?.status,
        oldDueAmount
      });

      // Only update stock and product details when status is "Received"
      if (data.status === "Received") {
        await Promise.all(
          rawItems.map((item) =>
            prisma.product.update({
              where: { id: item.productId },
              data: {
                excTax: {
                  set: Math.round(item.excTax)
                },
                incTax: {
                  set: Math.round(item.incTax)
                },
                margin: {
                  set: item.margin
                },
                sellingPrice: {
                  set: Math.round(item.sellingPrice)
                },
                tax: {
                  set: item.tax
                },
                stock: {
                  increment: item.quantity,
                },
              },
            })
          )
        );

        // Update supplier opening balance when status is "Received"
        if (finalDueAmount > 0) {
          console.log("Updating supplier opening balance (Received):", {
            supplierId: purchase.supplierId,
            finalDueAmount,
            status: data.status
          });

          // Check if supplier exists
          const supplier = await prisma.supplier.findUnique({
            where: { id: purchase.supplierId }
          });

          if (!supplier) {
            console.error("Supplier not found:", purchase.supplierId);
            throw new Error("Supplier not found");
          }

          console.log("Current supplier opening balance:", supplier.openingBalance);

          await prisma.supplier.update({
            where: { id: purchase.supplierId },
            data: {
              openingBalance: {
                increment: finalDueAmount
              }
            },
          });

          console.log("Supplier opening balance updated (Received)");
        }
      }

      // Handle cancellation - subtract from opening balance
      if (data.status === "Cancelled" && finalDueAmount > 0) {
        console.log("Updating supplier opening balance (Cancelled):", {
          supplierId: purchase.supplierId,
          finalDueAmount,
          status: data.status,
          previousStatus: currentPurchase?.status
        });

        // If the previous status was "Received", we need to subtract the old due amount
        // If the previous status was not "Received", we subtract the new due amount
        const amountToSubtract = currentPurchase?.status === "Received" ? oldDueAmount : finalDueAmount;

        console.log("Amount to subtract from opening balance:", amountToSubtract);

        await prisma.supplier.update({
          where: { id: purchase.supplierId },
          data: {
            openingBalance: {
              decrement: amountToSubtract
            }
          },
        });

        console.log("Supplier opening balance updated (Cancelled)");
      }

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

export const updatePurchaseStatus = actionClient
  .inputSchema(z.object({ id: z.string(), status: purchaseStatusEnum }))
  .action(async (values) => {
    const { id, status } = values.parsedInput;

    try {
      const currentPurchase = await prisma.purchase.findUnique({
        where: { id },
        include: { items: true },
      });

      if (!currentPurchase) return { error: "Purchase not found" };
      if (currentPurchase.status === status) return { data: currentPurchase };

      // 1. If transitioning TO Received, add stock and update balance
      if (status === "Received") {
        await Promise.all(
          currentPurchase.items.map((item) =>
            prisma.product.update({
              where: { id: item.productId },
              data: {
                stock: { increment: item.quantity },
                // We keep costs as is from the item snapshot
                excTax: { set: item.excTax },
                incTax: { set: item.incTax },
                margin: { set: item.margin },
                sellingPrice: { set: item.sellingPrice },
                tax: { set: item.tax },
              },
            })
          )
        );

        // Update supplier balance
        if (currentPurchase.dueAmount > 0) {
          await prisma.supplier.update({
            where: { id: currentPurchase.supplierId },
            data: {
              openingBalance: { increment: currentPurchase.dueAmount },
              purchaseDue: { increment: currentPurchase.dueAmount },
            },
          });
        }
      }

      // 2. If transitioning FROM Received (e.g. to Cancelled or pending), reverse stock and balance
      if (currentPurchase.status === "Received" && status !== "Received") {
        await Promise.all(
          currentPurchase.items.map((item) =>
            prisma.product.update({
              where: { id: item.productId },
              data: { stock: { decrement: item.quantity } },
            })
          )
        );

        if (currentPurchase.dueAmount > 0) {
          await prisma.supplier.update({
            where: { id: currentPurchase.supplierId },
            data: {
              openingBalance: { decrement: currentPurchase.dueAmount },
              purchaseDue: { decrement: currentPurchase.dueAmount },
            },
          });
        }
      }

      // Update the status
      const updatedPurchase = await prisma.purchase.update({
        where: { id },
        data: { status },
      });

      revalidatePath("/purchases");
      return { data: updatedPurchase };
    } catch (error) {
      console.error("Update Purchase Status Error:", error);
      return { error: "Something went wrong" };
    }
  });
