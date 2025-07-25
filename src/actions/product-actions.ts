"use server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { actionClient } from "@/lib/safeAction";
import { getProductByList, productSchema, productUpdateSchema } from "@/schemas/product-schema";
import { ObjectId } from 'mongodb';
import { revalidatePath } from 'next/cache';
import { headers } from "next/headers";
import { z } from 'zod';

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
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const role = session?.user?.role;
    const branchId = session?.user?.branch;

    const whereClause = role === "admin" ? {} : { branchId };

    const products = await prisma.product.findMany({
      where: whereClause,
      orderBy: { product_name: "desc" },
      include: {
        brand: true,
        category: true,
      },
    });

    return { products };
  } catch (error) {
    console.log("Get Product List error:", error);
    return { error: "Something went wrong" };
  }
});


export const getProductListForDropdown = actionClient.inputSchema(
    z.object({ query: z.string().optional() })
    ).action(async ({ parsedInput }) => {
    const query = parsedInput.query || "";
    const products = await prisma.product.findMany({
        where: {
        product_name: {
            contains: query,
            mode: "insensitive",
        },
        },
        take: 10,
    });

    return {
        products: products.map((p) => ({
        id: p.id,
        product_name: p.product_name,
        stock:p.stock,
        sellingPrice:p.sellingPrice,
        tax:p.tax,
        quantity:1,
        excTax:p.excTax,
        incTax:p.incTax
        })),
    };
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
