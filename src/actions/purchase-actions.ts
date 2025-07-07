"use server";
import { prisma } from "@/lib/prisma";
import { actionClient } from "@/lib/safeAction";
import {
  purchaseSchema,
  getPurchaseByIdSchema,
  purchaseUpdateSchema,
} from "@/schemas/purchase-schema";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";

export const createPurchase = actionClient
  .inputSchema(purchaseSchema)
  .action(async (values) => {
    try {
      const purchase = await prisma.purchase.create({
        data: values.parsedInput,
      });
      revalidatePath("/purchases");
      return { data: purchase };
    } catch (error) {
      console.log("Create Purchase Error:", error);
      return { error: "Something went wrong" };
    }
  });

export const getPurchaseList = actionClient.action(async () => {
  try {
    const purchases = await prisma.purchase.findMany({
      orderBy: { date: "desc" },
    });
    return { purchases };
  } catch (error) {
    console.log("Get Purchase List Error:", error);
    return { error: "Something went wrong" };
  }
});

export const getPurchaseById = actionClient
  .inputSchema(getPurchaseByIdSchema)
  .action(async (values) => {
    const { id } = values.parsedInput;
    if (!ObjectId.isValid(id)) {
      return { data: null };
    }
    const purchase = await prisma.purchase.findUnique({
      where: { id },
    });
    return { data: purchase };
  });

export const updatePurchase = actionClient
  .inputSchema(purchaseUpdateSchema)
  .action(async (values) => {
    const { id, ...data } = values.parsedInput;
    try {
      const purchase = await prisma.purchase.update({
        where: { id },
        data,
      });
      revalidatePath("/purchases");
      return { data: purchase };
    } catch (error) {
      console.log("Update Purchase Error:", error);
      return { error: "Something went wrong" };
    }
  });

export const deletePurchase = actionClient
  .inputSchema(getPurchaseByIdSchema)
  .action(async (values) => {
    const { id } = values.parsedInput;
    if (!ObjectId.isValid(id)) {
      return null;
    }
    revalidatePath("/purchases");
    return await prisma.purchase.delete({
      where: { id },
    });
  });
