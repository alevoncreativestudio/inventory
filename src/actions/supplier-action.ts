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
import { z } from "zod";

export const createSupplier = actionClient.inputSchema(supplierSchema).action(
  async (values) => {
    try {
      const { name, email, phone, ...otherData } = values.parsedInput;

      // Manual uniqueness checks
      const existingName = await prisma.supplier.findFirst({
        where: { name },
      });
      if (existingName) {
        return { error: "A supplier with this name already exists" };
      }

      if (email) {
        const existingEmail = await prisma.supplier.findFirst({
          where: { email },
        });
        if (existingEmail) {
          return { error: "A supplier with this email already exists" };
        }
      }

      if (phone) {
        const existingPhone = await prisma.supplier.findFirst({
          where: { phone },
        });
        if (existingPhone) {
          return { error: "A supplier with this phone number already exists" };
        }
      }

      const supplier = await prisma.supplier.create({
        data: {
          name,
          email: email || undefined,
          phone: phone || undefined,
          ...otherData,
        },
      });
      revalidatePath("/suppliers");
      return { data: supplier };
    } catch (error: any) {
      console.log("Create Supplier Error:", error);
      return { error: error?.message || "Failed to create supplier. Please try again." };
    }
  }
);

export const getSupplierList = actionClient
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
        headers: await headers(),
      });

      const role = session?.user?.role;
      const branchId = session?.user?.branch;

      const whereClause = role === "admin" ? {} : { branchId };

      const [suppliers, totalCount, totals] = await Promise.all([
        prisma.supplier.findMany({
          where: whereClause,
          orderBy: { name: "asc" },
          take: limit,
          skip: skip,
        }),
        prisma.supplier.count({ where: whereClause }),
        prisma.supplier.aggregate({
          where: whereClause,
          _sum: {
            openingBalance: true,
            purchaseDue: true,
            purchaseReturnDue: true
          },
        }),
      ]);

      const totalPages = Math.ceil(totalCount / limit);

      return {
        suppliers,
        metadata: {
          totalPages,
          totalCount,
          currentPage: page,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
        totals: {
          openingBalance: totals._sum.openingBalance || 0,
          purchaseDue: totals._sum.purchaseDue || 0,
          purchaseReturnDue: totals._sum.purchaseReturnDue || 0
        }
      };
    } catch (error) {
      console.log("Get Suppliers Error:", error);
      return { error: "Something went wrong" };
    }
  });


export const getSupplierListForDropdown = async () => {
  return await prisma.supplier.findMany({
    select: { id: true, name: true, openingBalance: true },
  });
};

export const updateSupplier = actionClient.inputSchema(updateSupplierSchema).action(
  async (values) => {
    const { id, name, email, phone, ...otherData } = values.parsedInput;
    try {
      // Manual uniqueness checks for update
      const existingName = await prisma.supplier.findFirst({
        where: { name, id: { not: id } },
      });
      if (existingName) {
        return { error: "A supplier with this name already exists" };
      }

      if (email) {
        const existingEmail = await prisma.supplier.findFirst({
          where: { email, id: { not: id } },
        });
        if (existingEmail) {
          return { error: "A supplier with this email already exists" };
        }
      }

      if (phone) {
        const existingPhone = await prisma.supplier.findFirst({
          where: { phone, id: { not: id } },
        });
        if (existingPhone) {
          return { error: "A supplier with this phone number already exists" };
        }
      }

      const updated = await prisma.supplier.update({
        where: { id },
        data: {
          name,
          email: email || undefined,
          phone: phone || undefined,
          ...otherData,
        },
      });
      revalidatePath("/suppliers");
      return { data: updated };
    } catch (error: any) {
      console.log("Update Supplier Error:", error);
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
