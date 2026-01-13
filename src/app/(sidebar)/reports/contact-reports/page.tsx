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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function ContactReportPage() {
  const supplierReports = await prisma.supplier.findMany({
    include: {
      purchase: {
        select: { totalAmount: true, dueAmount: true, paidAmount: true },
      },
      purchaseReturn: { select: { totalAmount: true } },
      BalancePayment: { select: { amount: true } },
    },
  });

  const customerReports = await prisma.customer.findMany({
    include: {
      sale: { select: { grandTotal: true, dueAmount: true, paidAmount: true } },
      salesReturn: { select: { grandTotal: true } },
      BalancePayment: { select: { amount: true } },
    },
  });

  const suppliers = supplierReports.map((supplier) => {
    const totalPurchases = supplier.purchase.reduce(
      (acc, p) => acc + p.totalAmount,
      0,
    );
    const totalPurchaseReturns = supplier.purchaseReturn.reduce(
      (acc, r) => acc + r.totalAmount,
      0,
    );
    const openingBalance = supplier.openingBalance;
    const totalPaidAmount = supplier.purchase.reduce(
      (acc, p) => acc + p.paidAmount,
      0,
    );
    const dueAmount = supplier.purchase.reduce(
      (acc, d) => acc + d.dueAmount,
      0,
    );
    return {
      id: supplier.id,
      name: supplier.name,
      type: "Supplier",
      totalPurchases,
      totalPurchaseReturns,
      totalPaidAmount,
      openingBalance,
      balance: dueAmount,
    };
  });

  const customers = customerReports.map((customer) => {
    const totalSales = customer.sale.reduce((acc, s) => acc + s.grandTotal, 0);
    const totalSalesReturns = customer.salesReturn.reduce(
      (acc, r) => acc + r.grandTotal,
      0,
    );
    const openingBalance = customer.openingBalance;
    const totalPaidAmount = customer.sale.reduce(
      (acc, p) => acc + p.paidAmount,
      0,
    );
    const dueAmount = customer.sale.reduce((acc, d) => acc + d.dueAmount, 0);

    return {
      id: customer.id,
      name: customer.name,
      type: "Customer",
      totalSales,
      totalSalesReturns,
      openingBalance,
      totalPaidAmount,
      balance: dueAmount,
    };
  });

  return (
    <div>
      <div className="my-4">
        <h1 className="text-2xl font-bold tracking-tight">Contact Reports</h1>
      </div>

      <Tabs defaultValue="customers" className="w-full">
        <TabsList className="bg-muted text-muted-foreground inline-flex h-10 items-center justify-center rounded-md p-1">
          <TabsTrigger value="customers">Customer Report</TabsTrigger>
          <TabsTrigger value="suppliers">Supplier Report</TabsTrigger>
        </TabsList>

        <TabsContent value="customers" className="mt-6">
          <Card className="p-4">
            <CardHeader>
              <CardTitle>Customer Report</CardTitle>
              <p className="text-muted-foreground text-sm">
                Summary of all customer activity
              </p>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableCaption>A summary of customer transactions.</TableCaption>
                <TableHeader className="bg-primary">
                  <TableRow>
                    <TableHead className="text-primary-foreground">
                      Name
                    </TableHead>
                    <TableHead className="text-primary-foreground text-center">
                      Sales
                    </TableHead>
                    <TableHead className="text-primary-foreground text-center">
                      Total Payed
                    </TableHead>
                    <TableHead className="text-primary-foreground text-center">
                      Sales Returns
                    </TableHead>
                    <TableHead className="text-primary-foreground text-center">
                      Opening Bal
                    </TableHead>
                    <TableHead className="text-primary-foreground text-center">
                      Balance
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">
                        {report.name}
                      </TableCell>
                      <TableCell className="text-center">
                        {formatCurrency(report.totalSales)}
                      </TableCell>
                      <TableCell className="text-center">
                        {formatCurrency(report.totalPaidAmount)}
                      </TableCell>
                      <TableCell className="text-center">
                        {formatCurrency(report.totalSalesReturns)}
                      </TableCell>
                      <TableCell className="text-center">
                        {formatCurrency(report.openingBalance)}
                      </TableCell>
                      <TableCell className="text-center font-semibold">
                        {formatCurrency(report.balance)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell className="text-right font-medium">
                      Grand Total
                    </TableCell>
                    <TableCell className="text-center font-bold">
                      {formatCurrency(
                        customers.reduce((sum, r) => sum + r.totalSales, 0),
                      )}
                    </TableCell>
                    <TableCell className="text-center font-bold">
                      {formatCurrency(
                        customers.reduce(
                          (sum, r) => sum + r.totalPaidAmount,
                          0,
                        ),
                      )}
                    </TableCell>
                    <TableCell className="text-center font-bold">
                      {formatCurrency(
                        customers.reduce(
                          (sum, r) => sum + r.totalSalesReturns,
                          0,
                        ),
                      )}
                    </TableCell>
                    <TableCell className="text-center font-bold">
                      {formatCurrency(
                        customers.reduce((sum, r) => sum + r.openingBalance, 0),
                      )}
                    </TableCell>
                    <TableCell className="text-center font-bold">
                      {formatCurrency(
                        customers.reduce((sum, r) => sum + r.balance, 0),
                      )}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suppliers" className="mt-6">
          <Card className="p-4">
            <CardHeader>
              <CardTitle>Supplier Report</CardTitle>
              <p className="text-muted-foreground text-sm">
                Summary of all supplier activity
              </p>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableCaption>A summary of supplier transactions.</TableCaption>
                <TableHeader className="bg-primary">
                  <TableRow>
                    <TableHead className="text-primary-foreground">
                      Name
                    </TableHead>
                    <TableHead className="text-primary-foreground text-center">
                      Purchases
                    </TableHead>
                    <TableHead className="text-primary-foreground text-center">
                      Total Payed
                    </TableHead>
                    <TableHead className="text-primary-foreground text-center">
                      Purchase Returns
                    </TableHead>
                    <TableHead className="text-primary-foreground text-center">
                      Opening Bal
                    </TableHead>
                    <TableHead className="text-primary-foreground text-center">
                      Balance
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {suppliers.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">
                        {report.name}
                      </TableCell>
                      <TableCell className="text-center">
                        {formatCurrency(report.totalPurchases)}
                      </TableCell>
                      <TableCell className="text-center">
                        {formatCurrency(report.totalPaidAmount)}
                      </TableCell>
                      <TableCell className="text-center">
                        {formatCurrency(report.totalPurchaseReturns)}
                      </TableCell>
                      <TableCell className="text-center">
                        {formatCurrency(report.openingBalance)}
                      </TableCell>
                      <TableCell className="text-center font-semibold">
                        {formatCurrency(report.balance)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell className="text-right font-medium">
                      Grand Total
                    </TableCell>
                    <TableCell className="text-center font-bold">
                      {formatCurrency(
                        suppliers.reduce((sum, r) => sum + r.totalPurchases, 0),
                      )}
                    </TableCell>
                    <TableCell className="text-center font-bold">
                      {formatCurrency(
                        suppliers.reduce(
                          (sum, r) => sum + r.totalPaidAmount,
                          0,
                        ),
                      )}
                    </TableCell>
                    <TableCell className="text-center font-bold">
                      {formatCurrency(
                        suppliers.reduce(
                          (sum, r) => sum + r.totalPurchaseReturns,
                          0,
                        ),
                      )}
                    </TableCell>
                    <TableCell className="text-center font-bold">
                      {formatCurrency(
                        suppliers.reduce((sum, r) => sum + r.openingBalance, 0),
                      )}
                    </TableCell>
                    <TableCell className="text-center font-bold">
                      {formatCurrency(
                        suppliers.reduce((sum, r) => sum + r.balance, 0),
                      )}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
