"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { actionClient } from "@/lib/safeAction";
import { headers } from "next/headers";

export interface StockReportItem {
  id: string;
  sku: string;
  product_name: string;
  variation?: string;
  category: string;
  location: string;
  unit_selling_price: number;
  current_stock: number;
  current_stock_value_purchase: number;
  current_stock_value_sale: number;
  potential_profit: number;
  total_unit_sold: number;
  unit: string;
}

export const getStockReportData = actionClient.action(async () => {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    const role = session?.user?.role;
    const branchId = session?.user?.branch;

    const whereClause = role === "admin" ? {} : { branchId };

    // Get all products with their related data
    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        brand: true,
        category: true,
        branch: true,
      },
    });

    // Get sales data for each product
    const salesData = await prisma.saleItem.groupBy({
      by: ['productId'],
      _sum: {
        quantity: true,
      }
    });

    // Get sales return data
    const salesReturnData = await prisma.salesReturnItem.groupBy({
      by: ['productId'],
      _sum: {
        quantity: true,
      }
    });

    // Create maps for quick lookup
    const salesMap = new Map(salesData.map(item => [item.productId, item._sum?.quantity || 0]));
    const salesReturnMap = new Map(salesReturnData.map(item => [item.productId, item._sum?.quantity || 0]));

    // Calculate stock report data
    const stockReport: StockReportItem[] = products.map(product => {
      const totalSold = salesMap.get(product.id) || 0;
      const totalSalesReturned = salesReturnMap.get(product.id) || 0;
      
      // Calculate current stock value by purchase price (using excTax as purchase price)
      const currentStockValuePurchase = product.stock * product.excTax;
      
      // Calculate current stock value by sale price
      const currentStockValueSale = product.stock * product.sellingPrice;
      
      // Calculate potential profit
      const potentialProfit = currentStockValueSale - currentStockValuePurchase;
      
      // Calculate total units sold (sales - sales returns)
      const totalUnitSold = totalSold - totalSalesReturned;

      return {
        id: product.id,
        sku: product.sku,
        product_name: product.product_name,
        variation: product.unit, // Using unit as variation for now
        category: product.category.name,
        location: product.branch?.name || "No Location",
        unit_selling_price: product.sellingPrice,
        current_stock: product.stock,
        current_stock_value_purchase: currentStockValuePurchase,
        current_stock_value_sale: currentStockValueSale,
        potential_profit: potentialProfit,
        total_unit_sold: totalUnitSold,
        unit: product.unit,
      };
    });

    return { data: stockReport };
  } catch (error) {
    console.error("Get Stock Report Error:", error);
    return { error: "Something went wrong" };
  }
});
