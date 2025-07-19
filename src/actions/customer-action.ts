"use server";

import { prisma } from "@/lib/prisma";
import { actionClient } from "@/lib/safeAction";
import {
  customerSchema,
  updateCustomerSchema,
  deleteCustomerSchema,
} from "@/schemas/customer-schema";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";

export const createCustomer = actionClient.inputSchema(customerSchema).action(
  async (values) => {
    try {
      const customer = await prisma.customer.create({
        data: values.parsedInput,
      });
      revalidatePath("/customers");
      return { data: customer };
    } catch (error) {
      console.log("Create Customer Error:", error);
      return { error: "Something went wrong" };
    }
  }
);

export const getCustomerList = actionClient.action(async () => {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: { name: "asc" },
    });
    revalidatePath("/customers");
    return { data: customers };
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
    } catch (error) {
      console.log("Update Customer Error:", error);
      return { error: "Something went wrong" };
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
