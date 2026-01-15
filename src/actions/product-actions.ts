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
      const data = values.parsedInput;
      // Round off amounts
      if (data.excTax) data.excTax = Math.round(data.excTax);
      if (data.incTax) data.incTax = Math.round(data.incTax);
      if (data.sellingPrice) data.sellingPrice = Math.round(data.sellingPrice);

      const product = await prisma.product.create({
        data,
      });
      revalidatePath("/products");
      return { data: product };
    } catch (error) {
      console.log("Product Creation Error :", error);
      return { error: "Something went wrong" };
    }
  });

export const getProductList = actionClient
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

      const [products, totalCount, totals] = await Promise.all([
        prisma.product.findMany({
          where: whereClause,
          orderBy: { product_name: "desc" },
          take: limit,
          skip: skip,
          include: {
            brand: true,
            category: true,
          },
        }),
        prisma.product.count({ where: whereClause }),
        prisma.product.aggregate({
          where: whereClause,
          _sum: {
            stock: true,
            // You can add other numeric fields if needed for totals
          },
        }),
      ]);

      const totalPages = Math.ceil(totalCount / limit);

      return {
        products,
        metadata: {
          totalPages,
          totalCount,
          currentPage: page,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
        totals: {
          stock: totals._sum.stock || 0
        }
      };
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
      stock: p.stock,
      tax: p.tax,
      sellingPrice: p.sellingPrice,
      margin: p.margin,
      quantity: 1,
      excTax: p.excTax,
      incTax: p.incTax,
      sellingPriceTaxType: p.sellingPriceTaxType
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
      include: {
        brand: true,
        category: true,
        branch: true,
      },
    });
    return { data: product };
  });

export const updateProduct = actionClient
  .inputSchema(productUpdateSchema)
  .action(async (values) => {
    const { id, ...inputData } = values.parsedInput;
    const data = { ...inputData };

    // Round off amounts
    if (data.excTax) data.excTax = Math.round(data.excTax);
    if (data.incTax) data.incTax = Math.round(data.incTax);
    if (data.sellingPrice) data.sellingPrice = Math.round(data.sellingPrice);

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
