"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { actionClient } from "@/lib/safeAction";
import {
  fullSalesSchema,
  getSalesByIdSchema,
  salesUpdateSchema,
} from "@/schemas/sales-item-schema";
import { RawSaleItem, RawSalesPayment } from "@/types/sales";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

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
  }));

// CREATE SALE
export const createSale = actionClient
  .inputSchema(fullSalesSchema)
  .action(async (values) => {
    try {
      const {
        items: rawItems,
        salesPayment: rawSalesPayment,
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
      
      await prisma.customer.update({
        where: { id: sale.customerId },
        data: {
          openingBalance: {
            decrement: dueAmount,
          },
          salesDue:{
            set:totalSalesDue
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
export const getSalesList = actionClient.action(async () => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const role = session?.user?.role;
    const branchId = session?.user?.branch;

    const whereClause = role === "admin" ? {} : { branchId };

    const sales = await prisma.sale.findMany({
      where: whereClause,
      orderBy: { salesdate: "desc" },
      include: { customer: true, items: true, payments: true ,branch:true},
    });

    return { sales };
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
      include: { items: true, customer: true, payments: true },
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
      ...data
    } = values.parsedInput;

    try {
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

      revalidatePath("/sales");
      return { data: sale };
    } catch (error) {
      console.error("Update Sale Error:", error);
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
