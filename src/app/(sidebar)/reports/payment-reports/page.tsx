import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function PaymentReportPage() {
  const [salesPayments, purchasePayments, balancePayments] = await Promise.all([
    prisma.salesPayment.findMany({
      include: {
        sale: { include: { customer: true } },
      },
    }),
    prisma.purchasePayment.findMany({
      include: {
        purchase: { include: { supplier: true } },
      },
    }),
    prisma.balancePayment.findMany({
      include: {
        customer: true,
        supplier: true,
      },
    }),
  ]);

  const combinedSalesPayments = [
    ...salesPayments.map((p) => ({
      id: p.id,
      name: p.sale.customer?.name ?? "—",
      method: p.paymentMethod,
      date: p.paidOn,
      amount: p.amount,
      type: "Sales",
    })),
    ...balancePayments
      .filter((p) => p.customerId)
      .map((p) => ({
        id: p.id,
        name: p.customer?.name ?? "—",
        method: p.method,
        date: p.paidOn,
        amount: p.amount,
        type: "Balance",
      })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  const combinedPurchasePayments = [
    ...purchasePayments.map((p) => ({
      id: p.id,
      name: p.purchase.supplier?.name ?? "—",
      method: p.paymentMethod,
      date: p.paidOn,
      amount: p.amount,
      type: "Purchase",
    })),
    ...balancePayments
      .filter((p) => p.supplierId)
      .map((p) => ({
        id: p.id,
        name: p.supplier?.name ?? "—",
        method: p.method,
        date: p.paidOn,
        amount: p.amount,
        type: "Balance",
      })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div>
      <div className="my-4">
        <h1 className="text-2xl font-bold tracking-tight">Payment Reports</h1>
      </div>

      <Tabs defaultValue="sales" className="w-full">
        <TabsList className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground">
          <TabsTrigger value="sales">Sales Payments</TabsTrigger>
          <TabsTrigger value="purchases">Purchase Payments</TabsTrigger>
        </TabsList>
        
        <TabsContent value="sales" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Sales Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableCaption>All incoming payments from customers</TableCaption>
                <TableHeader className="bg-primary">
                  <TableRow>
                    <TableHead className="text-primary-foreground">Customer</TableHead>
                    <TableHead className="text-primary-foreground">Method</TableHead>
                    <TableHead className="text-primary-foreground">Date</TableHead>
                    <TableHead className="text-right text-primary-foreground">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {combinedSalesPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>{payment.name}</TableCell>
                      <TableCell>{payment.method}</TableCell>
                      <TableCell>{format(new Date(payment.date), "dd MMM yyyy")}</TableCell>
                      <TableCell className="text-right text-green-600 font-medium">
                        {formatCurrency(payment.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="purchases" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Purchase Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableCaption>All outgoing payments to suppliers</TableCaption>
                <TableHeader className="bg-primary">
                  <TableRow>
                    <TableHead className="text-primary-foreground">Supplier</TableHead>
                    <TableHead className="text-primary-foreground">Method</TableHead>
                    <TableHead className="text-primary-foreground">Date</TableHead>
                    <TableHead className="text-right text-primary-foreground">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {combinedPurchasePayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>{payment.name}</TableCell>
                      <TableCell>{payment.method}</TableCell>
                      <TableCell>{format(new Date(payment.date), "dd MMM yyyy")}</TableCell>
                      <TableCell className="text-right text-red-600 font-medium">
                        {formatCurrency(payment.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
