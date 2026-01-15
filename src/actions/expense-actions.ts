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
import { z } from "zod";

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

export const getExpenseList = actionClient
  .inputSchema(
    z.object({
      page: z.number().default(1),
      limit: z.number().default(10),
      from: z.string().optional(),
      to: z.string().optional(),
    })
  )
  .action(async (values) => {
    try {
      const { page, limit, from, to } = values.parsedInput;
      const skip = (page - 1) * limit;

      const session = await auth.api.getSession({
        headers: await headers(),
      });

      const role = session?.user?.role;
      const branchId = session?.user?.branch;

      let whereClause: any = role === "admin" ? {} : { branchId };

      if (from && to) {
        const fromDate = new Date(from);
        fromDate.setHours(0, 0, 0, 0);
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);

        whereClause = {
          ...whereClause,
          createdAt: {
            gte: fromDate,
            lte: toDate,
          },
        };
      }

      const [expense, totalCount, totals] = await Promise.all([
        prisma.expense.findMany({
          where: whereClause,
          orderBy: { amount: "desc" },
          take: limit,
          skip: skip,
          include: { category: true },
        }),
        prisma.expense.count({ where: whereClause }),
        prisma.expense.aggregate({
          where: whereClause,
          _sum: {
            amount: true,
          },
        }),
      ]);

      const totalPages = Math.ceil(totalCount / limit);

      return {
        expense,
        metadata: {
          totalPages,
          totalCount,
          currentPage: page,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
        totals: {
          amount: totals._sum.amount || 0,
        }
      };
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
