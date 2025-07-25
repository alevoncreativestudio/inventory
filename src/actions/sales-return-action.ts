"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { actionClient } from "@/lib/safeAction";
import {
  fullSalesReturnSchema,
  getSalesReturnByIdSchema,
  updateFullSalesReturnSchema,
} from "@/schemas/sales-return-item-schema";
import { RawSalesReturnItem } from "@/types/sales-return";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

// Utility
const mapItemsWithRelation = (items: RawSalesReturnItem[]) =>
  items.map((item) => ({
    product_name: item.product_name ?? "Unnamed",
    quantity: item.quantity,
    incTax: item.incTax,
    subtotal: item.subtotal,
    total: item.total,
    product: {
      connect: { id: item.productId },
    },
  }));

// ✅ CREATE SALES RETURN
export const createSalesReturn = actionClient
  .inputSchema(fullSalesReturnSchema)
  .action(async (values) => {
    try {
      const { salesReturnItem:rawItems, ...returnData } = values.parsedInput;
      const returnItems = mapItemsWithRelation(rawItems);
      
      const grandTotal = returnItems.reduce((sum, item) => sum + (item.total || 0), 0);
      const salesReturn = await prisma.salesReturn.create({
        data: {
          ...returnData,
          grandTotal,
          salesReturnItem: {
            create: returnItems,
          },
        },
        include: {
          salesReturnItem: true,
        },
      });

      await Promise.all(
        rawItems.map(async (item) => {
          await prisma.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                increment: item.quantity,
              },
            },
          });
        })
      );

      revalidatePath("/sales-returns");
      return { data: salesReturn };
    } catch (error) {
      console.error("Create Sales Return Error:", error);
      return { error: "Something went wrong" };
    }
  });

// ✅ GET ALL SALES RETURNS
export const getSalesReturnList = actionClient.action(async () => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const role = session?.user?.role;
    const branchId = session?.user?.branch;

    const whereClause = role === "admin" ? {} : { branchId };

    const returns = await prisma.salesReturn.findMany({
      where: whereClause,
      orderBy: { salesReturnDate: "desc" },
      include: {
        customer: true,
        salesReturnItem: true,
      },
    });

    return { returns };
  } catch (error) {
    console.error("Get Sales Returns Error:", error);
    return { error: "Something went wrong" };
  }
});


// ✅ GET SALES RETURN BY ID
export const getSalesReturnById = actionClient
  .inputSchema(getSalesReturnByIdSchema)
  .action(async (values) => {
    const { id } = values.parsedInput;
    if (!ObjectId.isValid(id)) return { data: null };

    const returnEntry = await prisma.salesReturn.findUnique({
      where: { id },
      include: {
        customer: true,
        salesReturnItem: {
          include: { product: true },
        },
      },
    });

    return { data: returnEntry };
  });

// ✅ UPDATE SALES RETURN
export const updateSalesReturn = actionClient
  .inputSchema(updateFullSalesReturnSchema)
  .action(async (values) => {
    const { id, salesReturnItem:rawItems, ...data } = values.parsedInput;

    try {
      // Roll back stock
      const oldItems = await prisma.salesReturnItem.findMany({
        where: { salesReturnId: id },
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

      await prisma.salesReturnItem.deleteMany({ where: { salesReturnId: id } });

      const grandTotal = rawItems.reduce((sum, item) => sum + (item.total || 0), 0);
      const returnItems = mapItemsWithRelation(rawItems);

      const updated = await prisma.salesReturn.update({
        where: { id },
        data: {
          ...data,
          grandTotal,
          salesReturnItem: {
            create: returnItems,
          },
        },
        include: {
          salesReturnItem: true,
        },
      });

      // Restock again
      await Promise.all(
        rawItems.map((item) =>
          prisma.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                increment: item.quantity,
              },
            },
          })
        )
      );

      revalidatePath("/sales-returns");
      return { data: updated };
    } catch (error) {
      console.error("Update Sales Return Error:", error);
      return { error: "Something went wrong" };
    }
  });

// ✅ DELETE SALES RETURN
export const deleteSalesReturn = actionClient
  .inputSchema(getSalesReturnByIdSchema)
  .action(async (values) => {
    const { id } = values.parsedInput;
    if (!ObjectId.isValid(id)) return null;

    const oldItems = await prisma.salesReturnItem.findMany({
      where: { salesReturnId: id },
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

    await prisma.salesReturnItem.deleteMany({ where: { salesReturnId: id } });

    return await prisma.salesReturn.delete({ where: { id } });
  });
