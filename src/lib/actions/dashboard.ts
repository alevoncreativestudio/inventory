import { prisma } from '@/lib/prisma';

export async function getDashboardData(userId?: string, userRole?: string | null, userBranch?: string | null) {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  let userFilter: Record<string, string> = {};

   if (userRole === 'user' && userBranch) {
    userFilter = { branchId: userBranch };
  }

  const [
    totalSuppliers,
    totalCustomers,
    totalProducts,
    lowStockItems,
    recentProducts,
    recentSuppliers,
    purchaseTotal,
    salesTotal,
    expenseTotal,
    salesReturnTotal,
    purchaseReturnTotal,
  ] = await Promise.all([
    prisma.supplier.count({ where: userFilter }),
    prisma.customer.count({ where: userFilter }),
    prisma.product.count({ where: userFilter }),
    prisma.product.count({
      where: {
        ...userFilter,
        stock: { lt: 10 },
      },
    }),
    prisma.product.count({
      where: {
        ...userFilter,
        createdAt: { gte: sevenDaysAgo },
      },
    }),
    prisma.supplier.count({
      where: {
        ...userFilter,
        createdAt: { gte: sevenDaysAgo },
      },
    }),
    prisma.purchase.aggregate({
      _sum: { totalAmount: true },
      where: userFilter,
    }),
    prisma.sale.aggregate({
      _sum: { grandTotal: true },
      where: userFilter,
    }),
    prisma.expense.aggregate({
      _sum: { amount: true },
      where: userFilter,
    }),
    prisma.salesReturn.aggregate({
      _sum: { grandTotal: true },
      where: userFilter,
    }),
    prisma.purchaseReturn.aggregate({
      _sum: { totalAmount: true },
      where: userFilter,
    }),
  ]);

  return {
    stats: {
      totalSuppliers,
      totalCustomers,
      totalProducts,
      lowStockItems,
      recentProducts,
      recentSuppliers,
      totalPurchaseAmount: purchaseTotal._sum.totalAmount || 0,
      totalSaleAmount: salesTotal._sum.grandTotal || 0,
      totalExpenseAmount: expenseTotal._sum.amount || 0,
      totalSalesReturnAmount: salesReturnTotal._sum.grandTotal || 0,
      totalPurchaseReturnAmount: purchaseReturnTotal._sum.totalAmount || 0,
    },
    recentActivity: {
      newProducts: {
        count: recentProducts,
        description: `${recentProducts} new products added`,
      },
      suppliersAdded: {
        count: recentSuppliers,
        description: `${recentSuppliers} new suppliers onboarded`,
      },
    },
  };
}
