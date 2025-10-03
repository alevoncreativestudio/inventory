import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getOptimizedDashboardData } from '@/lib/actions/optimized-dashboard';
import { ChartAreaInteractive } from '@/components/dashboard/chart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { prisma } from '@/lib/prisma';
import { formatCurrency, formatDate } from '@/lib/utils';
import DashboardCharts from '@/components/graphs/sales-purchase-graph';
import { getMonthlyData } from '@/lib/actions/getMonthlyData';

import {
  IconUsers,
  IconClock,
  IconTrendingUp,
  IconTruck,
  IconPackage,
  IconShoppingCart,
  IconCurrencyDollar,
  IconAlertTriangle,
  IconChartBar,
} from '@tabler/icons-react';



export default async function Dashboard() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/login');
  }

  // Get branch name if user is not admin
  let branchName: string | undefined;
  if (session.user.role !== 'admin' && session.user.branch) {
    const branch = await prisma.branch.findUnique({
      where: { id: session.user.branch },
      select: { name: true },
    });
    branchName = branch?.name;
  }

  // Use optimized dashboard data fetcher
  const isAdmin = (session?.user?.role ?? '').toLowerCase() === 'admin';
  const branchFilter = isAdmin ? undefined : (session?.user?.branch || undefined);
  const dashboardData = await getOptimizedDashboardData(branchFilter);
  
  // Fetch chart data on server side
  const chartData = await getMonthlyData();

  const {
    totalSuppliers,
    totalCustomers,
    totalProducts,
    lowStockItems,
    todaysSales,
    todaysSalesCount,
    todaysPurchases,
    todaysPurchasesCount,
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
    totalOutstanding,
    outstandingCount,
  } = dashboardData;

  // Generic groupByMonth function for sales
  function groupSalesByMonth(records: typeof monthlySales) {
    const map = new Map<string, number>();

    records.forEach((r) => {
      const monthKey = new Date(r.salesdate).toLocaleString("default", {
        month: "short",
        year: "numeric",
      });
      const current = map.get(monthKey) || 0;
      map.set(monthKey, current + (r._sum.grandTotal || 0));
    });

    return Array.from(map.entries()).map(([month, value]) => ({
      month,
      value,
    }));
  }

  // Generic groupByMonth function for purchases
  function groupPurchasesByMonth(records: typeof monthlyPurchases) {
    const map = new Map<string, number>();

    records.forEach((r) => {
      const monthKey = new Date(r.purchaseDate).toLocaleString("default", {
        month: "short",
        year: "numeric",
      });
      const current = map.get(monthKey) || 0;
      map.set(monthKey, current + (r._sum.totalAmount || 0));
    });

    return Array.from(map.entries()).map(([month, value]) => ({
      month,
      value,
    }));
  }

  const salesData = groupSalesByMonth(monthlySales);        
  const purchaseData = groupPurchasesByMonth(monthlyPurchases);

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-6 p-4 md:p-6">
        {/* User welcome section */}
        <Card>
          <CardHeader>
            <CardTitle>Welcome back!</CardTitle>
            <CardDescription>
              Role: {session.user.role?.toUpperCase() || 'USER'}
              {session.user.role !== 'admin' && session.user.branch && (
                <> • Branch: {branchName || session.user.branch}</>
              )}
              {' • '}Last login: {new Date(session.session.createdAt).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Today's Performance */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-green-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription className="text-white">Today&apos;s Sales</CardDescription>
              <IconCurrencyDollar className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(todaysSales)}
              </div>
              <div className="text-sm mt-1">
                {todaysSalesCount} transactions
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription className="text-white">Today&apos;s Purchases</CardDescription>
              <IconShoppingCart className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(todaysPurchases)}
              </div>
              <div className="text-sm mt-1">
                {todaysPurchasesCount} transactions
              </div>
            </CardContent>
          </Card>

          <Card className="bg-red-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription className="text-white">Outstanding Amount</CardDescription>
              <IconAlertTriangle className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(totalOutstanding || 0)}
              </div>
              <div className="text-sm mt-1">
                {String(outstandingCount || 0)} pending payments
              </div>
            </CardContent>
          </Card>

          <Card className="bg-orange-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription className="text-white">Low Stock Items</CardDescription>
              <IconClock className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {lowStockItems}
              </div>
              <div className="text-sm mt-1">
                Need restocking
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardDescription>Total Suppliers</CardDescription>
              <IconTruck className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalSuppliers}</div>
              <p className="text-xs text-muted-foreground">
                +{recentSuppliers} this week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardDescription>Total Customers</CardDescription>
              <IconUsers className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCustomers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardDescription>Total Products</CardDescription>
              <IconPackage className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProducts}</div>
              <p className="text-xs text-muted-foreground">
                +{recentProducts} this week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardDescription>Stock Levels</CardDescription>
              <IconChartBar className="h-4 w-4 text-indigo-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stockLevels.length}</div>
              <p className="text-xs text-muted-foreground">
                Products tracked
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity & Top Performers */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Recent Sales */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <IconTrendingUp className="h-5 w-5" />
                <CardTitle>Recent Sales</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentSales.length > 0 ? (
                recentSales.map((sale) => (
                  <div key={sale.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <IconCurrencyDollar className="h-6 w-6 text-green-600" />
                      <div>
                        <p className="font-medium">{sale.customer.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {sale.items.length} items • {formatDate(sale.salesdate)}
                        </p>
                      </div>
                    </div>
                    <div className="text-lg font-bold text-green-600">
                      {formatCurrency(sale.grandTotal)}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">No recent sales</p>
              )}
            </CardContent>
          </Card>

          {/* Recent Purchases */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <IconShoppingCart className="h-5 w-5" />
                <CardTitle>Recent Purchases</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentPurchases.length > 0 ? (
                recentPurchases.map((purchase) => (
                  <div key={purchase.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <IconTruck className="h-6 w-6 text-blue-600" />
                      <div>
                        <p className="font-medium">{purchase.supplier.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {purchase.items.length} items • {formatDate(purchase.purchaseDate)}
                        </p>
                      </div>
                    </div>
                    <div className="text-lg font-bold text-blue-600">
                      {formatCurrency(purchase.totalAmount)}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">No recent purchases</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Top Performers */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Top Products */}
          <Card>
            <CardHeader>
              <CardTitle>Top Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topProducts.length > 0 ? (
                  topProducts.map((item, index) => (
                    <div key={item.productId} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>
                        <span className="font-medium">{item.product?.product_name || 'Unknown'}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {item._sum.quantity} sold
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-4">No data available</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Top Suppliers */}
          <Card>
            <CardHeader>
              <CardTitle>Top Suppliers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topSuppliers.length > 0 ? (
                  topSuppliers.map((item, index) => (
                    <div key={item.supplierId} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>
                        <span className="font-medium">{item.supplier?.name || 'Unknown'}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {formatCurrency(item._sum.totalAmount || 0)}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-4">No data available</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Top Customers */}
          <Card>
            <CardHeader>
              <CardTitle>Top Customers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topCustomers.length > 0 ? (
                  topCustomers.map((item, index) => (
                    <div key={item.customerId} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>
                        <span className="font-medium">{item.customer?.name || 'Unknown'}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {formatCurrency(item._sum.grandTotal || 0)}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-4">No data available</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Interactive Area Chart */}
          <ChartAreaInteractive data={chartData} />
          
          {/* Monthly Sales & Purchases Bar Chart */}
          <DashboardCharts salesData={salesData} purchaseData={purchaseData} />
        </div>

        {/* Stock Levels */}
        <Card>
          <CardHeader>
            <CardTitle>Stock Levels</CardTitle>
            <CardDescription>Current inventory status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stockLevels.length > 0 ? (
                stockLevels.map((product) => (
                  <div key={product.product_name} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <IconPackage className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{product.product_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {product.category?.name || 'No category'} • {formatCurrency(product.sellingPrice)}
                        </p>
                      </div>
                    </div>
                    <div className={`text-lg font-bold ${
                      product.stock < 10 ? 'text-red-600' : 
                      product.stock < 50 ? 'text-orange-600' : 'text-green-600'
                    }`}>
                      {product.stock} units
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">No products in inventory</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
