"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { actionClient } from "@/lib/safeAction";
import {
  fullSalesSchema,
  getSalesByIdSchema,
  salesUpdateSchema,
} from "@/schemas/sales-item-schema";
import { SalesStatusEnum } from "@/schemas/sales-schema"; // Added import
import { RawSaleItem, RawSalesPayment } from "@/types/sales";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod"; // Added import

const mapItemsWithRelation = (items: RawSaleItem[]) =>
  items.map((item) => ({
    product_name: item.product_name ?? "Unnamed",
    quantity: item.quantity,
    excTax: item.excTax,
    incTax: item.incTax,
    discount: item.discount,
    subtotal: item.subtotal,
    total: item.total,
    product: {
      connect: { id: item.productId },
    },
  }));

const mapPaymentsWithRelation = (payments: RawSalesPayment[]) =>
  payments.map((payment) => ({
    amount: payment.amount,
    paidOn: payment.paidOn,
    paymentMethod: payment.paymentMethod,
    paymentNote: payment.paymentNote,
    dueDate: payment.dueDate
  }));

// CREATE SALE
export const createSale = actionClient
  .inputSchema(fullSalesSchema)
  .action(async (values) => {
    try {
      const {
        items: rawItems,
        salesPayment: rawSalesPayment,
        status, // Extract status to exclude it from saleData
        ...saleData
      } = values.parsedInput;

      const items = mapItemsWithRelation(rawItems);
      const salesPayment = mapPaymentsWithRelation(rawSalesPayment);

      const grandTotal = rawItems.reduce((sum, item) => sum + (item.total || 0), 0);
      const paidAmount = rawSalesPayment.reduce((sum, p) => sum + (p.amount || 0), 0);
      const dueAmount = grandTotal - paidAmount;

      const totalSalesDue = dueAmount <= 0 ? 0 : dueAmount



      const sale = await prisma.sale.create({
        data: {
          ...saleData,
          grandTotal,
          dueAmount,
          payments: { create: salesPayment },
          items: { create: items },
        },
        include: {
          items: true,
          payments: true,
        },
      });

      // If status is Dispatched, decrement stock
      if (status === "Dispatched") {
        await Promise.all(
          rawItems.map((item) =>
            prisma.product.update({
              where: { id: item.productId },
              data: {
                stock: {
                  decrement: item.quantity,
                },
              },
            })
          )
        );
      }

      await prisma.customer.update({
        where: { id: sale.customerId },
        data: {
          salesDue: {
            increment: totalSalesDue
          }
        },
      });

      revalidatePath("/sales");
      return { data: sale };
    } catch (error) {
      console.error("Create Sale Error:", error);
      return { error: "Something went wrong" };
    }
  });

// GET ALL SALES
export const getSalesList = actionClient
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

      const whereClause: any = role === "admin" ? {} : { branchId };

      if (from || to) {
        whereClause.salesdate = {};
        if (from) {
          whereClause.salesdate.gte = new Date(from);
        }
        if (to) {
          // Set time to end of day for inclusive filtering
          const toDate = new Date(to);
          toDate.setHours(23, 59, 59, 999);
          whereClause.salesdate.lte = toDate;
        }
      }

      const [sales, totalCount, totals] = await Promise.all([
        prisma.sale.findMany({
          where: whereClause,
          orderBy: { salesdate: "desc" },
          take: limit,
          skip: skip,
          include: {
            customer: true,
            items: {
              include: {
                product: true,
              },
            },
            payments: true,
            branch: true,
          },
        }),
        prisma.sale.count({ where: whereClause }),
        prisma.sale.aggregate({
          where: whereClause,
          _sum: {
            grandTotal: true,
            dueAmount: true,
            paidAmount: true,
          },
        }),
      ]);

      const totalPages = Math.ceil(totalCount / limit);

      return {
        sales,
        metadata: {
          totalPages,
          totalCount,
          currentPage: page,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
        totals: {
          grandTotal: totals._sum.grandTotal || 0,
          dueAmount: totals._sum.dueAmount || 0,
          paidAmount: totals._sum.paidAmount || 0,
        }
      };
    } catch (error) {
      console.error("Get Sales List Error:", error);
      return { error: "Something went wrong" };
    }
  });


// GET SALE BY ID
export const getSaleById = actionClient
  .inputSchema(getSalesByIdSchema)
  .action(async (values) => {
    const { id } = values.parsedInput;
    if (!ObjectId.isValid(id)) {
      return { data: null };
    }

    const sale = await prisma.sale.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true
          }
        },
        customer: true,
        payments: true,
        branch: true
      },
    });

    return { data: sale };
  });

// UPDATE SALE
export const updateSale = actionClient
  .inputSchema(salesUpdateSchema)
  .action(async (values) => {
    const {
      id,
      items: rawItems,
      salesPayment: rawSalesPayment,
      status, // Extract status
      ...data
    } = values.parsedInput;

    try {
      const currentSale = await prisma.sale.findUnique({
        where: { id },
        include: { items: true },
      });

      // 1. Reverse stock if previously Dispatched (using any checked type here to avoid lint since client is stale)
      if ((currentSale as any)?.status === "Dispatched") {
        const oldItems = await prisma.saleItem.findMany({
          where: { saleId: id },
          select: { productId: true, quantity: true },
        });

        await Promise.all(
          oldItems.map((item) =>
            prisma.product.update({
              where: { id: item.productId },
              data: {
                stock: {
                  increment: item.quantity,
                },
              },
            })
          )
        );
      }

      await prisma.saleItem.deleteMany({ where: { saleId: id } });
      await prisma.salesPayment.deleteMany({ where: { salesId: id } });

      const items = mapItemsWithRelation(rawItems);
      const payments = mapPaymentsWithRelation(rawSalesPayment);

      const grandTotal = rawItems.reduce((sum, item) => sum + (item.total || 0), 0);
      const paidAmount = rawSalesPayment.reduce((sum, p) => sum + (p.amount || 0), 0);
      const dueAmount = grandTotal - paidAmount;

      const sale = await prisma.sale.update({
        where: { id },
        data: {
          ...data,
          status,
          grandTotal,
          dueAmount,
          items: { create: items },
          payments: { create: payments },
        },
        include: {
          items: true,
          payments: true,
        },
      });

      // 2. Decrement stock if currently Dispatched
      if (status === "Dispatched") {
        await Promise.all(
          rawItems.map((item) =>
            prisma.product.update({
              where: { id: item.productId },
              data: {
                stock: {
                  decrement: item.quantity,
                },
              },
            })
          )
        );
      }

      revalidatePath("/sales");
      return { data: sale };
    } catch (error) {
      console.error("Update Sale Error:", error);
      return { error: "Something went wrong" };
    }
  });

export const updateSalesStatus = actionClient
  .inputSchema(z.object({ id: z.string(), status: SalesStatusEnum }))
  .action(async (values) => {
    const { id, status } = values.parsedInput;

    try {
      const currentSale = await prisma.sale.findUnique({
        where: { id },
        include: { items: true },
      });

      if (!currentSale) return { error: "Sale not found" };
      if ((currentSale as any).status === status) return { data: currentSale };

      // 1. If transitioning TO Dispatched, decrement stock
      if (status === "Dispatched") {
        await Promise.all(
          currentSale.items.map((item) =>
            prisma.product.update({
              where: { id: item.productId },
              data: {
                stock: { decrement: item.quantity },
              },
            })
          )
        );
      }

      // 2. If transitioning FROM Dispatched (e.g. to Cancelled), increment stock back
      if ((currentSale as any).status === "Dispatched" && status !== "Dispatched") {
        await Promise.all(
          currentSale.items.map((item) =>
            prisma.product.update({
              where: { id: item.productId },
              data: {
                stock: { increment: item.quantity },
              },
            })
          )
        );
      }

      // Update the status
      const updatedSale = await prisma.sale.update({
        where: { id },
        data: { status } as any,
      });

      revalidatePath("/sales");
      return { data: updatedSale };
    } catch (error) {
      console.error("Update Sales Status Error:", error);
      return { error: "Something went wrong" };
    }
  });

// DELETE SALE
export const deleteSale = actionClient
  .inputSchema(getSalesByIdSchema)
  .action(async (values) => {
    const { id } = values.parsedInput;

    if (!ObjectId.isValid(id)) return null;

    await prisma.saleItem.deleteMany({ where: { saleId: id } });
    await prisma.salesPayment.deleteMany({ where: { salesId: id } });

    return await prisma.sale.delete({ where: { id } });
  });
