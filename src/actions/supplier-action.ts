"use server";

import { prisma } from "@/lib/prisma";
import { actionClient } from "@/lib/safeAction";
import {
  supplierSchema,
  updateSupplierSchema,
  deleteSupplierSchema,
} from "@/schemas/supplier-schema";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";

export const createSupplier = actionClient.inputSchema(supplierSchema).action(
  async (values) => {
    try {
      const supplier = await prisma.supplier.create({
        data: values.parsedInput,
      });
      revalidatePath("/suppliers");
      return { data: supplier };
    } catch (error) {
      console.log("Create Supplier Error:", error);
      return { error: "Something went wrong" };
    }
  }
);

export const getSupplierList = actionClient.action(async () => {
  try {
    const suppliers = await prisma.supplier.findMany({
      orderBy: { name: "asc" },
    });
    revalidatePath("/suppliers");
    return { data: suppliers };
  } catch (error) {
    console.log("Get Suppliers Error:", error);
    return { error: "Something went wrong" };
  }
});

export const getSupplierListForDropdown = async () => {
  return await prisma.supplier.findMany({
    select: { id: true, name: true,openingBalance:true },
  });
};

export const updateSupplier = actionClient.inputSchema(updateSupplierSchema).action(
  async (values) => {
    const { id, ...data } = values.parsedInput;
    try {
      const updated = await prisma.supplier.update({
        where: { id },
        data,
      });
      revalidatePath("/suppliers");
      return { data: updated };
    } catch (error) {
      console.log("Update Supplier Error:", error);
      return { error: "Something went wrong" };
    }
  }
);

export const deleteSupplier = actionClient.inputSchema(deleteSupplierSchema).action(
  async (values) => {
    const { id } = values.parsedInput;
    if (!ObjectId.isValid(id)) return null;

    try {
      const deleted = await prisma.supplier.delete({
        where: { id },
      });
      revalidatePath("/suppliers");
      return { data: deleted };
    } catch (error) {
      console.log("Delete Supplier Error:", error);
      return { error: "Something went wrong" };
    }
  }
);
