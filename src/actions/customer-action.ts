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

export const createCustomer = actionClient.inputSchema(customerSchema).action(
  async (values) => {
    try {
      const customer = await prisma.customer.create({
        data: values.parsedInput,
      });
      revalidatePath("/customers");
      return { data: customer };
    } catch (error: any) {
      console.log("Create Customer Error:", error);
      
      // Handle unique constraint violations
      if (error?.code === 'P2002') {
        const target = error?.meta?.target;
        if (Array.isArray(target)) {
          if (target.includes('name')) {
            return { error: "A customer with this name already exists" };
          }
          if (target.includes('email') && values.parsedInput.email) {
            return { error: "A customer with this email already exists" };
          }
          if (target.includes('phone') && values.parsedInput.phone) {
            return { error: "A customer with this phone number already exists" };
          }
        }
        return { error: "A customer with this information already exists" };
      }
      
      return { error: error?.message || "Failed to create customer. Please try again." };
    }
  }
);

export const getCustomerList = actionClient.action(async () => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const role = session?.user?.role;
    const branchId = session?.user?.branch;

    const whereClause = role === "admin" ? {} : { branchId };

    const customers = await prisma.customer.findMany({
      where: whereClause,
      orderBy: { name: "asc" },
    });

    return { customers };
  } catch (error) {
    console.log("Get Customers Error:", error);
    return { error: "Something went wrong" };
  }
});


export const getCustomerListForDropdown = async () => {
  return await prisma.customer.findMany({
    select: { id: true, name:true,openingBalance:true},
  });
};

export const updateCustomer = actionClient.inputSchema(updateCustomerSchema).action(
  async (values) => {
    const { id, ...data } = values.parsedInput;
    try {
      const updated = await prisma.customer.update({
        where: { id },
        data,
      });
      revalidatePath("/customers");
      return { data: updated };
    } catch (error: any) {
      console.log("Update Customer Error:", error);
      
      // Handle unique constraint violations
      if (error?.code === 'P2002') {
        const target = error?.meta?.target;
        if (Array.isArray(target)) {
          if (target.includes('name')) {
            return { error: "A customer with this name already exists" };
          }
          if (target.includes('email') && data.email) {
            return { error: "A customer with this email already exists" };
          }
          if (target.includes('phone') && data.phone) {
            return { error: "A customer with this phone number already exists" };
          }
        }
        return { error: "A customer with this information already exists" };
      }
      
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
