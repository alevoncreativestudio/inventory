"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { actionClient } from "@/lib/safeAction";
import {
  supplierSchema,
  updateSupplierSchema,
  deleteSupplierSchema,
} from "@/schemas/supplier-schema";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

export const createSupplier = actionClient.inputSchema(supplierSchema).action(
  async (values) => {
    try {
      const supplier = await prisma.supplier.create({
        data: values.parsedInput,
      });
      revalidatePath("/suppliers");
      return { data: supplier };
    } catch (error: any) {
      console.log("Create Supplier Error:", error);
      
      // Handle unique constraint violations
      if (error?.code === 'P2002') {
        const target = error?.meta?.target;
        if (Array.isArray(target)) {
          if (target.includes('name')) {
            return { error: "A supplier with this name already exists" };
          }
          if (target.includes('email') && values.parsedInput.email) {
            return { error: "A supplier with this email already exists" };
          }
          if (target.includes('phone') && values.parsedInput.phone) {
            return { error: "A supplier with this phone number already exists" };
          }
        }
        return { error: "A supplier with this information already exists" };
      }
      
      return { error: error?.message || "Failed to create supplier. Please try again." };
    }
  }
);

export const getSupplierList = actionClient.action(async () => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const role = session?.user?.role;
    const branchId = session?.user?.branch;

    const whereClause = role === "admin" ? {} : { branchId };

    const suppliers = await prisma.supplier.findMany({
      where: whereClause,
      orderBy: { name: "asc" },
    });
    return { suppliers };
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
    } catch (error: any) {
      console.log("Update Supplier Error:", error);
      
      // Handle unique constraint violations
      if (error?.code === 'P2002') {
        const target = error?.meta?.target;
        if (Array.isArray(target)) {
          if (target.includes('name')) {
            return { error: "A supplier with this name already exists" };
          }
          if (target.includes('email') && data.email) {
            return { error: "A supplier with this email already exists" };
          }
          if (target.includes('phone') && data.phone) {
            return { error: "A supplier with this phone number already exists" };
          }
        }
        return { error: "A supplier with this information already exists" };
      }
      
      return { error: error?.message || "Failed to update supplier. Please try again." };
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
