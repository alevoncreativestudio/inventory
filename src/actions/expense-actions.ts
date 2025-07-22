"use server";
import { prisma } from "@/lib/prisma";
import { actionClient } from "@/lib/safeAction";
import {
  expenseSchema,
  getExpenseByList,
  updateExpenseSchema,
} from "@/schemas/expense-schema";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";

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
    const expense = await prisma.expense.findMany({
      orderBy: { amount: "desc" },
      include:{category:true}
    });
    return { expense };
  } catch (error) {
    console.log("Get expense Error :", error);
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
