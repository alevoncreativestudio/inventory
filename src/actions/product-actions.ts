"use server";
import { prisma } from "@/lib/prisma";
import { actionClient } from "@/lib/safeAction";
import {
  getProductByList,
  productSchema,
  productUpdateSchema,
} from "@/schemas/product-schema";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";

export const createProduct = actionClient
  .inputSchema(productSchema)
  .action(async (values) => {
    try {
      const product = await prisma.product.create({
        data: values.parsedInput,
      });
      revalidatePath("/products");
      return { data: product };
    } catch (error) {
      console.log("Product Creation Error :", error);
      return { error: "Something went wrong" };
    }
  });

export const getProductList = actionClient.action(async () => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { product_name: "desc" },
      include: { brand: true, category: true },
    });
    return { products };
  } catch (error) {
    console.log("Get Product List error :", error);
    return { error: "Something went wrong" };
  }
});

export const getProductById = actionClient
  .inputSchema(getProductByList)
  .action(async (values) => {
    const { id } = values.parsedInput;
    if (!ObjectId.isValid(id)) {
      return { data: null };
    }
    const product = await prisma.product.findUnique({
      where: { id },
    });
    return { data: product };
  });

export const updateProduct = actionClient
  .inputSchema(productUpdateSchema)
  .action(async (values) => {
    const { id, ...data } = values.parsedInput;
    try {
      const product = await prisma.product.update({
        where: { id },
        data,
      });
      revalidatePath("/products");
      return { data: product };
    } catch (error) {
      console.log("Updating Product Error :", error);
      return { error: "Something went wrong" };
    }
  });

export const deleteProduct = actionClient
  .inputSchema(getProductByList)
  .action(async (values) => {
    const { id } = values.parsedInput;
    if (!ObjectId.isValid(id)) {
      return null;
    }
    revalidatePath("/products");
    return await prisma.product.delete({
      where: { id },
    });
  });
