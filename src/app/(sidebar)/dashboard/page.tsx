import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getDashboardData } from '@/lib/actions/dashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { prisma } from '@/lib/prisma';

import {
  IconUsers,
  IconUserPlus,
  IconClock,
  IconTrendingUp,
  IconUserCheck,
  IconTruck,
  IconPackage,
  IconShoppingCart,
  IconArrowBackUp,
  IconCurrencyDollar,
  IconArrowForwardUp,
  IconReportMoney,
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

  const dashboardData = await getDashboardData(
    session.user.id,
    session.user.role,
    session.user.branch
  );

  const { stats, recentActivity } = dashboardData;

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

        {/* Top Stats Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardDescription>Total Suppliers</CardDescription>
              <IconTruck className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSuppliers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardDescription>Total Customers</CardDescription>
              <IconUsers className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCustomers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardDescription>Total Products</CardDescription>
              <IconPackage className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProducts}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardDescription>Low Stock Items</CardDescription>
              <IconClock className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.lowStockItems}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardDescription>Total Purchase</CardDescription>
              <IconShoppingCart className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{stats.totalPurchaseAmount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardDescription>Total Purchase Return</CardDescription>
              <IconArrowBackUp className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{stats.totalPurchaseReturnAmount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardDescription>Total Sales</CardDescription>
              <IconCurrencyDollar className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{stats.totalSaleAmount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardDescription>Total Sales Return</CardDescription>
              <IconArrowForwardUp className="h-4 w-4 text-rose-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{stats.totalSalesReturnAmount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardDescription>Total Expenses</CardDescription>
              <IconReportMoney className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{stats.totalExpenseAmount}</div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <IconTrendingUp className="h-5 w-5" />
                <CardTitle>Recent Activity (Last 7 Days)</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <IconUserPlus className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="font-medium">New Products</p>
                    <p className="text-sm text-muted-foreground">
                      {recentActivity.newProducts.count} items added
                    </p>
                  </div>
                </div>
                <div className="text-2xl font-bold">{recentActivity.newProducts.count}</div>
              </div>

              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <IconUserCheck className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="font-medium">New Suppliers</p>
                    <p className="text-sm text-muted-foreground">
                      {recentActivity.suppliersAdded.count} onboarded
                    </p>
                  </div>
                </div>
                <div className="text-2xl font-bold">{recentActivity.suppliersAdded.count}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
