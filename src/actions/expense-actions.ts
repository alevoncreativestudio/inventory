"use server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { actionClient } from "@/lib/safeAction";
import {
  expenseSchema,
  getExpenseByList,
  updateExpenseSchema,
} from "@/schemas/expense-schema";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

export const createExpense = actionClient
  .inputSchema(expenseSchema)
  .action(async (values) => {
    try {
      const expense = await prisma.expense.create({
        data: values.parsedInput,
      });
      revalidatePath("/expenses");
      return { data: expense };
    } catch (error) {
      console.log("Created expense Error :", error);
      return { error: "Something went wrong" };
    }
  });

export const getExpenseList = actionClient.action(async () => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const role = session?.user?.role;
    const branchId = session?.user?.branch;

    const whereClause = role === "admin" ? {} : { branchId };

    const expense = await prisma.expense.findMany({
      where: whereClause,
      orderBy: { amount: "desc" },
      include: { category: true },
    });

    return { expense };
  } catch (error) {
    console.log("Get expense Error :", error);
    return { error: "Something went wrong" };
  }
});


export const updateExpense = actionClient
  .inputSchema(updateExpenseSchema)
  .action(async (values) => {
    const { id, ...data } = values.parsedInput;
    try {
      const expense = await prisma.expense.update({
        where: { id },
        data,
      });
      revalidatePath("/expenses");
      return { data: expense };
    } catch (error) {
      console.log("Error on expense Updating :", error);
      return { error: "Something went wrong" };
    }
  });

export const deleteExpense = actionClient
  .inputSchema(getExpenseByList)
  .action(async (values) => {
    const { id } = values.parsedInput;
    if (!ObjectId.isValid(id)) {
      return null;
    }
    revalidatePath("/expenses");
    return await prisma.expense.delete({
      where: { id },
    });
  });
