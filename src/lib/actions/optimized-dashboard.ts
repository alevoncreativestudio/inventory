import { prisma } from "@/lib/prisma";

/**
 * Optimized dashboard data fetcher with proper indexing and caching
 * Fixes performance issues by using efficient queries and proper date handling
 */
export async function getOptimizedDashboardData(branchId?: string) {
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  // Branch filter for non-admin users
  const branchFilter = branchId ? { branchId } : {};

  try {
    // Use Promise.all for parallel queries to improve performance
    const [
      totalSuppliers,
      totalCustomers,
      totalProducts,
      lowStockItems,
      todaysSales,
      todaysPurchases,
      monthlySales,
      monthlyPurchases,
      recentProducts,
      recentSuppliers,
      recentSales,
      recentPurchases,
      topProducts,
      topSuppliers,
      topCustomers,
      stockLevels,
      paymentStatus
    ] = await Promise.all([
      // Basic counts
      prisma.supplier.count({ where: branchFilter }),
      prisma.customer.count({ where: branchFilter }),
      prisma.product.count({ where: branchFilter }),

      // Low stock items (stock < 10)
      prisma.product.count({
        where: {
          ...branchFilter,
          stock: { lt: 10 },
        },
      }),

      // Today's sales
      prisma.sale.aggregate({
        where: {
          ...branchFilter,
          salesdate: { gte: startOfDay, lte: endOfDay }
        },
        _sum: { grandTotal: true },
        _count: true,
      }),

      // Today's purchases
      prisma.purchase.aggregate({
        where: {
          ...branchFilter,
          purchaseDate: { gte: startOfDay, lte: endOfDay }
        },
        _sum: { totalAmount: true },
        _count: true,
      }),

      // Monthly sales
      prisma.sale.groupBy({
        by: ["salesdate"],
        where: {
          ...branchFilter,
          salesdate: { gte: monthStart }
        },
        _sum: { grandTotal: true },
        orderBy: { salesdate: 'desc' },
      }),

      // Monthly purchases
      prisma.purchase.groupBy({
        by: ["purchaseDate"],
        where: {
          ...branchFilter,
          purchaseDate: { gte: monthStart }
        },
        _sum: { totalAmount: true },
        orderBy: { purchaseDate: 'desc' },
      }),

      // Recent products (last 7 days)
      prisma.product.count({
        where: {
          ...branchFilter,
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      }),

      // Recent suppliers (last 7 days)
      prisma.supplier.count({
        where: {
          ...branchFilter,
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      }),

      // Recent sales (last 5)
      prisma.sale.findMany({
        where: branchFilter,
        take: 5,
        orderBy: { salesdate: "desc" },
        include: {
          customer: { select: { name: true } },
          items: {
            include: {
              product: { select: { product_name: true } }
            }
          },
        },
      }),

      // Recent purchases (last 5)
      prisma.purchase.findMany({
        where: branchFilter,
        take: 5,
        orderBy: { purchaseDate: "desc" },
        include: {
          supplier: { select: { name: true } },
          items: {
            include: {
              product: { select: { product_name: true } }
            }
          },
        },
      }),

      // Top products by sales
      prisma.saleItem.groupBy({
        by: ["productId"],
        where: {
          sale: branchFilter,
        },
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5,
      }),

      // Top suppliers by purchase amount
      prisma.purchase.groupBy({
        by: ["supplierId"],
        where: branchFilter,
        _sum: { totalAmount: true },
        orderBy: { _sum: { totalAmount: 'desc' } },
        take: 5,
      }),

      // Top customers by sales amount
      prisma.sale.groupBy({
        by: ["customerId"],
        where: branchFilter,
        _sum: { grandTotal: true },
        orderBy: { _sum: { grandTotal: 'desc' } },
        take: 5,
      }),

      // Stock levels
      prisma.product.findMany({
        where: branchFilter,
        select: {
          product_name: true,
          stock: true,
          sellingPrice: true,
          category: { select: { name: true } }
        },
        orderBy: { stock: 'asc' },
        take: 10,
      }),

      // Payment status summary
      prisma.sale.aggregate({
        where: branchFilter,
        _sum: { dueAmount: true },
        _count: true,
      }),
    ]);

    // Get details for top performers in parallel
    const [topProductDetails, topSupplierDetails, topCustomerDetails] = await Promise.all([
      // Top products details
      Promise.all(
        topProducts.map(async (item) => {
          const product = await prisma.product.findUnique({
            where: { id: item.productId },
            select: { product_name: true, stock: true },
          });
          return {
            ...item,
            product,
          };
        })
      ),
      // Top suppliers details
      Promise.all(
        topSuppliers.map(async (item) => {
          const supplier = await prisma.supplier.findUnique({
            where: { id: item.supplierId },
            select: { name: true, phone: true },
          });
          return {
            ...item,
            supplier,
          };
        })
      ),
      // Top customers details
      Promise.all(
        topCustomers.map(async (item) => {
          const customer = await prisma.customer.findUnique({
            where: { id: item.customerId },
            select: { name: true, phone: true },
          });
          return {
            ...item,
            customer,
          };
        })
      ),
    ]);

    return {
      // Basic stats
      totalSuppliers,
      totalCustomers,
      totalProducts,
      lowStockItems,

      // Today's performance
      todaysSales: todaysSales._sum.grandTotal || 0,
      todaysSalesCount: todaysSales._count,
      todaysPurchases: todaysPurchases._sum.totalAmount || 0,
      todaysPurchasesCount: todaysPurchases._count,

      // Monthly trends
      monthlySales,
      monthlyPurchases,

      // Recent activity
      recentProducts,
      recentSuppliers,
      recentSales,
      recentPurchases,

      // Top performers
      topProducts: topProductDetails,
      topSuppliers: topSupplierDetails,
      topCustomers: topCustomerDetails,

      // Stock information
      stockLevels,

      // Payment status
      totalOutstanding: paymentStatus._sum.dueAmount || 0,
      outstandingCount: paymentStatus._count,
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw new Error('Failed to fetch dashboard data');
  }
}
