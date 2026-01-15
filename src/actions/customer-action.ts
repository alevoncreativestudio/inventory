"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { actionClient } from "@/lib/safeAction";
import {
  customerSchema,
  updateCustomerSchema,
  deleteCustomerSchema,
} from "@/schemas/customer-schema";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";

export const createCustomer = actionClient.inputSchema(customerSchema).action(
  async (values) => {
    try {
      const { name, email, phone, ...otherData } = values.parsedInput;

      // Manual uniqueness checks
      const existingName = await prisma.customer.findFirst({
        where: { name },
      });
      if (existingName) {
        return { error: "A customer with this name already exists" };
      }

      if (email) {
        const existingEmail = await prisma.customer.findFirst({
          where: { email },
        });
        if (existingEmail) {
          return { error: "A customer with this email already exists" };
        }
      }

      if (phone) {
        const existingPhone = await prisma.customer.findFirst({
          where: { phone },
        });
        if (existingPhone) {
          return { error: "A customer with this phone number already exists" };
        }
      }

      const customer = await prisma.customer.create({
        data: {
          name,
          email: email || undefined,
          phone: phone || undefined,
          ...otherData,
        },
      });
      revalidatePath("/customers");
      return { data: customer };
    } catch (error: any) {
      console.log("Create Customer Error:", error);
      return { error: error?.message || "Failed to create customer. Please try again." };
    }
  }
);

export const getCustomerList = actionClient
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

      const [customers, totalCount, totals] = await Promise.all([
        prisma.customer.findMany({
          where: whereClause,
          orderBy: { name: "asc" },
          take: limit,
          skip: skip,
        }),
        prisma.customer.count({ where: whereClause }),
        prisma.customer.aggregate({
          where: whereClause,
          _sum: {
            openingBalance: true,
            outstandingPayments: true,
            salesDue: true,
            salesReturnDue: true
          },
        }),
      ]);

      const totalPages = Math.ceil(totalCount / limit);

      return {
        customers,
        metadata: {
          totalPages,
          totalCount,
          currentPage: page,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
        totals: {
          openingBalance: totals._sum.openingBalance || 0,
          outstandingPayments: totals._sum.outstandingPayments || 0,
          salesDue: totals._sum.salesDue || 0,
          salesReturnDue: totals._sum.salesReturnDue || 0
        }
      };
    } catch (error) {
      console.log("Get Customers Error:", error);
      return { error: "Something went wrong" };
    }
  });


export const getCustomerListForDropdown = async () => {
  return await prisma.customer.findMany({
    select: { id: true, name: true, openingBalance: true },
  });
};

export const updateCustomer = actionClient.inputSchema(updateCustomerSchema).action(
  async (values) => {
    const { id, name, email, phone, ...otherData } = values.parsedInput;
    try {
      // Manual uniqueness checks for update
      const existingName = await prisma.customer.findFirst({
        where: { name, id: { not: id } },
      });
      if (existingName) {
        return { error: "A customer with this name already exists" };
      }

      if (email) {
        const existingEmail = await prisma.customer.findFirst({
          where: { email, id: { not: id } },
        });
        if (existingEmail) {
          return { error: "A customer with this email already exists" };
        }
      }

      if (phone) {
        const existingPhone = await prisma.customer.findFirst({
          where: { phone, id: { not: id } },
        });
        if (existingPhone) {
          return { error: "A customer with this phone number already exists" };
        }
      }

      const updated = await prisma.customer.update({
        where: { id },
        data: {
          name,
          email: email || undefined,
          phone: phone || undefined,
          ...otherData,
        },
      });
      revalidatePath("/customers");
      return { data: updated };
    } catch (error: any) {
      console.log("Update Customer Error:", error);
      return { error: error?.message || "Failed to update customer. Please try again." };
    }
  }
);

export const deleteCustomer = actionClient.inputSchema(deleteCustomerSchema).action(
  async (values) => {
    const { id } = values.parsedInput;
    if (!ObjectId.isValid(id)) return null;

    try {
      const deleted = await prisma.customer.delete({
        where: { id },
      });
      revalidatePath("/customers");
      return { data: deleted };
    } catch (error) {
      console.log("Delete Customer Error:", error);
      return { error: "Something went wrong" };
    }
  }
);
