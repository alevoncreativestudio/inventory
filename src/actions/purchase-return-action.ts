"use server";

import { prisma } from "@/lib/prisma";
import { actionClient } from "@/lib/safeAction";
import {
  fullPurchaseReturnSchema,
  getPurchaseReturnByIdSchema,
  updateFullPurchaseReturnSchema,
} from "@/schemas/purchase-return-item-schema";
import { RawPurchaseReturnItem } from "@/types/purchase-return";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";

const mapItemsWithRelation = (items: RawPurchaseReturnItem[]) =>
  items.map((item) => ({
    product_name: item.product_name ?? "Unnamed",
    quantity: item.quantity,
    excTax: item.excTax,
    subtotal: item.subtotal,
    total: item.total,
    product: {
      connect: { id: item.productId },
    }
  }));

// ✅ CREATE PURCHASE RETURN
export const createPurchaseReturn = actionClient
  .inputSchema(fullPurchaseReturnSchema)
  .action(async (values) => {
    try {
      const { purchaseReturnItem:rawItems, ...returnData } = values.parsedInput;
      const items = mapItemsWithRelation(rawItems);

      const totalAmount = items.reduce((sum, item) => sum + (item.total || 0), 0);

      const purchaseReturn = await prisma.purchaseReturn.create({
        data: {
          ...returnData,
          totalAmount,
          purchaseReturnItem: {
            create: items,
          },
        },
        include: {
          purchaseReturnItem: true,
        },
      });

      await Promise.all(
        rawItems.map(async (item) => {
          await prisma.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          });
        })
      );

      revalidatePath("/purchase-returns");
      return { data: purchaseReturn };
    } catch (error) {
      console.error("Create Purchase Return Error:", error);
      return { error: "Something went wrong" };
    }
  });

// GET ALL PURCHASE RETURNS
export const getPurchaseReturnList = actionClient.action(async () => {
  try {
    const returns = await prisma.purchaseReturn.findMany({
      orderBy: { returnDate: "desc" },
      include: {
        supplier: true,
        purchaseReturnItem: true,
      },
    });
    return { returns };
  } catch (error) {
    console.error("Get Purchase Returns Error:", error);
    return { error: "Something went wrong" };
  }
});

// GET PURCHASE RETURN BY ID
export const getPurchaseReturnById = actionClient
  .inputSchema(getPurchaseReturnByIdSchema)
  .action(async (values) => {
    const { id } = values.parsedInput;
    if (!ObjectId.isValid(id)) return { data: null };

    const returnEntry = await prisma.purchaseReturn.findUnique({
      where: { id },
      include: {
        supplier: true,
        purchaseReturnItem: {
          include: { product: true },
        },
      },
    });

    return { data: returnEntry };
  });

// UPDATE PURCHASE RETURN
export const updatePurchaseReturn = actionClient
  .inputSchema(updateFullPurchaseReturnSchema)
  .action(async (values) => {
    const { id, purchaseReturnItem:rawItems, ...data } = values.parsedInput;

    try {
      const oldItems = await prisma.purchaseReturnItem.findMany({
        where: { purchaseReturnId: id },
      });

      await Promise.all(
        oldItems.map((item) =>
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

      await prisma.purchaseReturnItem.deleteMany({
        where: { purchaseReturnId: id },
      });

      const totalAmount = rawItems.reduce((sum, item) => sum + (item.total || 0), 0);
      const returnItems = mapItemsWithRelation(rawItems);

      const updated = await prisma.purchaseReturn.update({
        where: { id },
        data: {
          ...data,
          totalAmount,
          purchaseReturnItem: {
            create: returnItems,
          },
        },
        include: {
          purchaseReturnItem: true,
        },
      });

      // Decrease stock for new items
      await Promise.all(
        rawItems.map((item) =>
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

      revalidatePath("/purchase-returns");
      return { data: updated };
    } catch (error) {
      console.error("Update Purchase Return Error:", error);
      return { error: "Something went wrong" };
    }
  });

// ✅ DELETE PURCHASE RETURN
export const deletePurchaseReturn = actionClient
  .inputSchema(getPurchaseReturnByIdSchema)
  .action(async (values) => {
    const { id } = values.parsedInput;
    if (!ObjectId.isValid(id)) return null;

    // Revert stock
    const oldItems = await prisma.purchaseReturnItem.findMany({
      where: { purchaseReturnId: id },
    });

    await Promise.all(
      oldItems.map((item) =>
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

    // Delete return and items
    await prisma.purchaseReturnItem.deleteMany({ where: { purchaseReturnId: id } });
    return await prisma.purchaseReturn.delete({ where: { id } });
  });
