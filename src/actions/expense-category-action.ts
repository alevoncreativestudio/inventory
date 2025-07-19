"use server"

import { prisma } from "@/lib/prisma";
import { actionClient } from "@/lib/safeAction";
import {
  expenseCategorySchema,
  deleteExpenseCategorySchema,
  updateExpenseCategorySchema,
} from "@/schemas/expense-category-schema";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";

export const createExpenseCategory = actionClient.inputSchema(expenseCategorySchema)
  .action(async (values) => {
    try {
      const category = await prisma.expenseCategory.create({
        data: values.parsedInput,
      });
      revalidatePath("/expense-categories");
      return { data: category };
    } catch (error) {
      console.error("Create ExpenseCategory Error:", error);
      return { error: "Something went wrong" };
    }
  });

export const getExpenseCategoryList = actionClient.action(async () => {
  try {
    const categories = await prisma.expenseCategory.findMany({
      orderBy: { name: "asc" },
    });
    revalidatePath("/expense-categories");
    return { data: categories };
  } catch (error) {
    console.error("Get ExpenseCategory Error:", error);
  }
});

export const getExpenseCategoryDropdown = async () => {
  return await prisma.expenseCategory.findMany({
    select: { id: true, name: true },
  });
};

export const updateExpenseCategory = actionClient.inputSchema(updateExpenseCategorySchema)
  .action(async (values) => {
    const { id, ...data } = values.parsedInput;
    try {
      const category = await prisma.expenseCategory.update({
        where: { id },
        data,
      });
      revalidatePath("/expense-categories");
      return { data: category };
    } catch (error) {
      console.error("Update ExpenseCategory Error:", error);
      return { error: "Something went wrong" };
    }
  });

export const deleteExpenseCategory = actionClient.inputSchema(deleteExpenseCategorySchema)
  .action(async (values) => {
    const { id } = values.parsedInput;
    if (!ObjectId.isValid(id)) {
      return null;
    }
    return await prisma.expenseCategory.delete({
      where: { id },
    });
  });
