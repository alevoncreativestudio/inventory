import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getOptimizedDashboardData } from '@/lib/actions/optimized-dashboard';
import { ChartAreaInteractive } from '@/components/dashboard/chart';
import { Card, CardContent } from '@/components/ui/card';
import { prisma } from '@/lib/prisma';
import { formatCurrency, formatDate } from '@/lib/utils';
import DashboardCharts from '@/components/graphs/sales-purchase-graph';
import { getMonthlyData } from '@/lib/actions/getMonthlyData';

import {
  IconUsers,
  IconPackage,
  IconCurrencyDollar,
  IconRefresh,
  IconStar,
  IconHeart,
  IconTrophy,
  IconArrowUp,
  IconArrowDown,
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

  // Use branchName in the header if needed
  const displayBranch = branchName ? ` - ${branchName}` : '';

  // Use optimized dashboard data fetcher
  const isAdmin = (session?.user?.role ?? '').toLowerCase() === 'admin';
  const branchFilter = isAdmin ? undefined : (session?.user?.branch || undefined);
  const dashboardData = await getOptimizedDashboardData(branchFilter);

  // Fetch chart data on server side
  const chartData = await getMonthlyData();

  const {
    totalCustomers,
    totalProducts,
    todaysSales,
    todaysSalesCount,
    todaysPurchases,
    todaysPurchasesCount,
    monthlySales,
    monthlyPurchases,
    recentSales,
    topProducts,
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
    <div className="min-h-screen bg-gray-50">
      {/* Modern Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <h1 className="text-2xl font-bold text-gray-900">Welcome, {session.user.name || 'User'}{displayBranch}</h1>
            </div>
            <p className="text-sm text-gray-600">Your inventory dashboard overview</p>
          </div>
          {/* <div className="flex items-center gap-4">
            <div className="relative">
              <IconSearch className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search" 
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="relative">
              <IconBell className="h-5 w-5 text-gray-600 cursor-pointer hover:text-gray-900" />
              <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></div>
            </div>
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <IconUser className="h-5 w-5 text-gray-600" />
            </div>
          </div> */}
        </div>
      </div>

      <div className="flex">
        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Inventory Balance Card - Prominent Display */}
            <div className="bg-gradient-to-r from-purple-900 to-purple-800 rounded-2xl p-8 text-white">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Today&apos;s Sales</h2>
              </div>
              <div className="text-4xl font-bold">
                {formatCurrency(todaysSales)}
              </div>
            </div>

            {/* Profile Card */}
            <Card className="shadow-md border border-border/50 bg-gradient-to-br from-indigo-50 via-white to-emerald-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Profile</h3>
                  <IconRefresh className="h-5 w-5 text-gray-400 cursor-pointer hover:text-gray-600" />
                </div>
                <div className="flex flex-col items-center">
                  <div className="relative mb-4">
                    <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                      {session.user.name?.charAt(0) || 'U'}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                      <IconStar className="h-3 w-3 text-white" />
                    </div>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900">{session.user.name || 'User'}</h4>
                  <p className="text-sm text-gray-600">{session.user.role?.toUpperCase() || 'USER'}</p>
                  <div className="flex gap-4 mt-4">
                    <div className="flex items-center gap-1 text-gray-600">
                      <IconUsers className="h-4 w-4" />
                      <span className="text-sm">{totalCustomers}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600">
                      <IconHeart className="h-4 w-4" />
                      <span className="text-sm">{totalProducts}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600">
                      <IconTrophy className="h-4 w-4" />
                      <span className="text-sm">{todaysSalesCount}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Charts Section */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-1">
              {/* Interactive Area Chart */}
              <ChartAreaInteractive data={chartData} />

              {/* Monthly Sales & Purchases Bar Chart */}
              <DashboardCharts salesData={salesData} purchaseData={purchaseData} />
            </div>


            {/* Financial Record */}

            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Financial Record</h2>
                <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
                  <span className="text-sm text-gray-600">Month</span>
                  <IconArrowDown className="h-4 w-4 text-gray-600" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-medium text-green-700">Today&apos;s Sales</h3>
                      <IconArrowUp className="h-4 w-4 text-gray-400" />
                    </div>
                    <div className="text-2xl font-bold text-green-900 mb-2">
                      {formatCurrency(todaysSales)}
                    </div>
                    <div className="flex items-center gap-2 text-green-600">
                      <IconArrowUp className="h-4 w-4" />
                      <span className="text-sm">{todaysSalesCount} transactions</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-orange-50 border-orange-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-medium text-orange-700">Today&apos;s Purchases</h3>
                      <IconArrowUp className="h-4 w-4 text-gray-400" />
                    </div>
                    <div className="text-2xl font-bold text-orange-900 mb-2">
                      {formatCurrency(todaysPurchases)}
                    </div>
                    <div className="flex items-center gap-2 text-orange-600">
                      <IconArrowUp className="h-4 w-4" />
                      <span className="text-sm">{todaysPurchasesCount} transactions</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-medium text-blue-700">Outstanding</h3>
                      <IconArrowUp className="h-4 w-4 text-gray-400" />
                    </div>
                    <div className="text-2xl font-bold text-blue-900 mb-2">
                      {formatCurrency(totalOutstanding || 0)}
                    </div>
                    <div className="flex items-center gap-2 text-blue-600">
                      <IconArrowUp className="h-4 w-4" />
                      <span className="text-sm">{outstandingCount} pending</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Top Products - Enhanced Card Style */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Top Products</h2>
                <button className="text-blue-600 text-sm font-medium hover:text-blue-700">View all</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {topProducts.length > 0 ? (
                  topProducts.slice(0, 4).map((product, index) => (
                    <div key={product.productId} className="bg-gradient-to-r from-green-400 to-green-500 rounded-xl p-4 text-white">
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-sm font-medium">#{index + 1} Product</div>
                        <IconPackage className="h-5 w-5" />
                      </div>
                      <div className="text-2xl font-bold mb-2">{product.product?.product_name || 'Unknown'}</div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm opacity-80">Stock: {product.product?.stock || 0}</div>
                          <div className="text-xs opacity-60">Sold: {product._sum.quantity}</div>
                        </div>
                        <div className="text-sm font-medium">TOP</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No product data available</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Right Sidebar - Transactions */}
        <div className="w-80 bg-white border-l border-gray-200 p-6">
          {/* Transactions */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Transactions</h2>
              <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
                <span className="text-sm text-gray-600">Month</span>
                <IconArrowDown className="h-4 w-4 text-gray-600" />
              </div>
            </div>
            <div className="space-y-4">
              {recentSales.slice(0, 6).map((sale) => (
                <div key={sale.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <IconCurrencyDollar className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{sale.customer.name}</p>
                      <p className="text-xs text-gray-500">{formatDate(sale.salesdate)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">{formatCurrency(sale.grandTotal)}</p>
                    <div className="w-4 h-4 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-xs text-gray-500">0</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stock Levels */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Stock Levels</h2>
              <button className="text-blue-600 text-sm font-medium hover:text-blue-700">View all</button>
            </div>
            <div className="space-y-3">
              {stockLevels.slice(0, 5).map((product) => (
                <div key={product.product_name} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <IconPackage className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">{product.product_name}</p>
                      <p className="text-xs text-gray-500">
                        {product.category?.name || 'No category'}
                      </p>
                    </div>
                  </div>
                  <div className={`text-sm font-bold ${product.stock < 10 ? 'text-red-600' :
                      product.stock < 50 ? 'text-orange-600' : 'text-green-600'
                    }`}>
                    {product.stock}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}