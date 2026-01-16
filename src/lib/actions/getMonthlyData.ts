import { prisma } from "@/lib/prisma";

export async function getMonthlyData() {
  try {
    // Get sales and purchase data in parallel
    const [salesData, purchaseData] = await Promise.all([
      prisma.sale.groupBy({
        by: ["salesdate"],
        _sum: { grandTotal: true },
        orderBy: { salesdate: "asc" },
      }),
      prisma.purchase.groupBy({
        by: ["purchaseDate"],
        _sum: { totalAmount: true },
        orderBy: { purchaseDate: "asc" },
      }),
    ]);

    // Create a map to combine sales and purchases by date
    const dataMap = new Map<string, { sales: number; purchases: number }>();

    // Process sales data
    salesData.forEach((item) => {
      const dateKey = item.salesdate.toISOString().split('T')[0];
      const existing = dataMap.get(dateKey) || { sales: 0, purchases: 0 };
      dataMap.set(dateKey, {
        ...existing,
        sales: item._sum.grandTotal || 0,
      });
    });

    // Process purchase data
    purchaseData.forEach((item) => {
      const dateKey = item.purchaseDate.toISOString().split('T')[0];
      const existing = dataMap.get(dateKey) || { sales: 0, purchases: 0 };
      dataMap.set(dateKey, {
        ...existing,
        purchases: item._sum.totalAmount || 0,
      });
    });

    // Convert to array and sort by date
    const monthlyData = Array.from(dataMap.entries())
      .map(([date, values]) => ({
        date,
        sales: values.sales,
        purchases: values.purchases,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return monthlyData;
  } catch (error) {
    console.error('Error fetching monthly data:', error);
    return [];
  }
}
