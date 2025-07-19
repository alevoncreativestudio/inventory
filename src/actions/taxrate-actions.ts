"use server";

import { prisma } from "@/lib/prisma";
import { actionClient } from "@/lib/safeAction";
import {
  taxrateSchema,
  updatetaxrateSchema,
  deletetaxrateSchema,
} from "@/schemas/taxrates-schema";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";

export const createTaxRate = actionClient.inputSchema(taxrateSchema).action(async (values) => {
  try {
    const taxRate = await prisma.taxRates.create({
      data: values.parsedInput,
    });
    revalidatePath("/settings");
    return { data: taxRate };
  } catch (error) {
    console.log("Create TaxRate Error:", error);
    return { error: "Something went wrong" };
  }
});

export const getTaxRateList = actionClient.action(async () => {
  try {
    const taxRates = await prisma.taxRates.findMany({
      orderBy: { name: "asc" },
    });
    revalidatePath("/settings");
    return { data: taxRates };
  } catch (error) {
    console.log("Get TaxRates Error:", error);
  }
});

export const getTaxRateListForDropdown = async () => {
  return await prisma.taxRates.findMany({
    select: { id: true, name: true, taxRate: true },
    orderBy: { name: "asc" },
  });
};

export const updateTaxRate = actionClient
  .inputSchema(updatetaxrateSchema)
  .action(async (values) => {
    const { id, ...data } = values.parsedInput;

    try {
      const updated = await prisma.taxRates.update({
        where: { id },
        data,
      });
      revalidatePath("/settings");
      return { data: updated };
    } catch (error) {
      console.log("Update TaxRate Error:", error);
      return { error: "Something went wrong" };
    }
  });

export const deleteTaxRate = actionClient.inputSchema(deletetaxrateSchema).action(async (values) => {
  const { id } = values.parsedInput;

  if (!ObjectId.isValid(id)) {
    return null;
  }

  try {
    const deleted = await prisma.taxRates.delete({
      where: { id },
    });
    revalidatePath("/settings");
    return { data: deleted };
  } catch (error) {
    console.log("Delete TaxRate Error:", error);
    return { error: "Something went wrong" };
  }
});
