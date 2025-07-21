import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ContactReportPage() {
  const supplierReports = await prisma.supplier.findMany({
    include: {
      purchase: { select: { totalAmount: true, dueAmount: true ,paidAmount:true} },
      purchaseReturn: { select: { totalAmount: true } },
      BalancePayment: { select: { amount: true} },
    },
  });

  const customerReports = await prisma.customer.findMany({
    include: {
      sale: { select: { grandTotal: true, dueAmount: true, paidAmount:true } },
      salesReturn: { select: { grandTotal: true } },
      BalancePayment: { select: { amount: true } },
    },
  });

  const suppliers = supplierReports.map((supplier) => {
    const totalPurchases = supplier.purchase.reduce((acc, p) => acc + p.totalAmount, 0);
    const totalPurchaseReturns = supplier.purchaseReturn.reduce((acc, r) => acc + r.totalAmount, 0);
    const openingBalance = supplier.openingBalance;
    const totalPaidAmount = supplier.purchase.reduce((acc,p) => acc + p.paidAmount,0);
    const dueAmount = supplier.purchase.reduce((acc,d) => acc + d.dueAmount,0);
    return {
      id: supplier.id,
      name: supplier.name,
      type: "Supplier",
      totalPurchases,
      totalPurchaseReturns,
      totalPaidAmount,
      openingBalance,
      balance:dueAmount,
    };
  });

  const customers = customerReports.map((customer) => {
    const totalSales = customer.sale.reduce((acc, s) => acc + s.grandTotal, 0);
    const totalSalesReturns = customer.salesReturn.reduce((acc, r) => acc + r.grandTotal, 0);
    const openingBalance = customer.openingBalance;
    const totalPaidAmount = customer.sale.reduce((acc,p) => acc + p.paidAmount,0);
    const dueAmount = customer.sale.reduce((acc,d) => acc + d.dueAmount,0);

    return {
      id: customer.id,
      name: customer.name,
      type: "Customer",
      totalSales,
      totalSalesReturns,
      openingBalance,
      totalPaidAmount,
      balance:dueAmount,
    };
  });

  return (
    <div>
      <div className="my-4">
        <h1 className="text-2xl font-bold tracking-tight">Customer and Supplier Reports</h1>
      </div>

      <div className="grid grid-cols-1 gap-6">
          <Card className="p-4">
            <CardHeader>
              <CardTitle>Customer Report</CardTitle>
              <p className="text-sm text-muted-foreground">Summary of all customer activity</p>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableCaption>A summary of customer transactions.</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="text-right">Sales</TableHead>
                    <TableHead className="text-right">Total Payed</TableHead>
                    <TableHead className="text-right">Sales Returns</TableHead>
                    <TableHead className="text-right">Opening Bal</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">{report.name}</TableCell>
                      <TableCell className="text-right">{formatCurrency(report.totalSales)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(report.totalPaidAmount)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(report.totalSalesReturns)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(report.openingBalance)}</TableCell>
                      <TableCell className="text-right font-semibold">{formatCurrency(report.balance)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell className="text-right font-medium">Grand Total</TableCell>
                    <TableCell className="text-right font-bold">
                      {formatCurrency(customers.reduce((sum, r) => sum + r.totalSales, 0))}
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      {formatCurrency(customers.reduce((sum, r) => sum + r.totalPaidAmount, 0))}
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      {formatCurrency(customers.reduce((sum, r) => sum + r.totalSalesReturns, 0))}
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      {formatCurrency(customers.reduce((sum, r) => sum + r.openingBalance, 0))}
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      {formatCurrency(customers.reduce((sum, r) => sum + r.balance, 0))}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </CardContent>
          </Card>

          <Card className="p-4">
            <CardHeader>
              <CardTitle>Supplier Report</CardTitle>
              <p className="text-sm text-muted-foreground">Summary of all supplier activity</p>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableCaption>A summary of supplier transactions.</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="text-right">Purchases</TableHead>
                    <TableHead className="text-right">Total Payed</TableHead>
                    <TableHead className="text-right">Purchase Returns</TableHead>
                    <TableHead className="text-right">Opening Bal</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {suppliers.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">{report.name}</TableCell>
                      <TableCell className="text-right">{formatCurrency(report.totalPurchases)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(report.totalPaidAmount)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(report.totalPurchaseReturns)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(report.openingBalance)}</TableCell>
                      <TableCell className="text-right font-semibold">{formatCurrency(report.balance)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell className="text-right font-medium">Grand Total</TableCell>
                    <TableCell className="text-right font-bold">
                      {formatCurrency(suppliers.reduce((sum, r) => sum + r.totalPurchases, 0))}
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      {formatCurrency(suppliers.reduce((sum, r) => sum + r.totalPaidAmount, 0))}
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      {formatCurrency(suppliers.reduce((sum, r) => sum + r.totalPurchaseReturns, 0))}
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      {formatCurrency(suppliers.reduce((sum, r) => sum + r.openingBalance, 0))}
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      {formatCurrency(suppliers.reduce((sum, r) => sum + r.balance, 0))}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </CardContent>
          </Card>
      </div>
    </div>
  );
}
