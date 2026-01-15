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
import { PaginationControls } from "@/components/ui/pagination-controls";

interface PaymentReportPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function PaymentReportPage({
  searchParams,
}: PaymentReportPageProps) {
  const resolvedSearchParams = await searchParams;
  const page = Number(resolvedSearchParams?.page) || 1;
  const limit = Number(resolvedSearchParams?.limit) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;

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

  const allSalesPayments = [
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

  const allPurchasePayments = [
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

  // Paginate
  const combinedSalesPayments = allSalesPayments.slice(startIndex, endIndex);
  const combinedPurchasePayments = allPurchasePayments.slice(
    startIndex,
    endIndex,
  );

  const totalSalesCount = allSalesPayments.length;
  const totalPurchaseCount = allPurchasePayments.length;

  const salesTotalPages = Math.ceil(totalSalesCount / limit);
  const purchaseTotalPages = Math.ceil(totalPurchaseCount / limit);

  return (
    <div>
      <div className="my-4">
        <h1 className="text-2xl font-bold tracking-tight">Payment Reports</h1>
      </div>

      <Tabs defaultValue="sales" className="w-full">
        <TabsList className="bg-muted text-muted-foreground inline-flex h-10 items-center justify-center rounded-md p-1">
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
                    <TableHead className="text-primary-foreground">
                      Customer
                    </TableHead>
                    <TableHead className="text-primary-foreground text-center">
                      Method
                    </TableHead>
                    <TableHead className="text-primary-foreground text-center">
                      Date
                    </TableHead>
                    <TableHead className="text-primary-foreground text-center">
                      Amount
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {combinedSalesPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>{payment.name}</TableCell>
                      <TableCell className="text-center">
                        {payment.method}
                      </TableCell>
                      <TableCell className="text-center">
                        {format(new Date(payment.date), "dd MMM yyyy")}
                      </TableCell>
                      <TableCell className="text-center font-medium text-green-600">
                        {formatCurrency(payment.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <PaginationControls
                totalPages={salesTotalPages}
                hasNextPage={page < salesTotalPages}
                hasPrevPage={page > 1}
                totalCount={totalSalesCount}
              />
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
                    <TableHead className="text-primary-foreground">
                      Supplier
                    </TableHead>
                    <TableHead className="text-primary-foreground text-center">
                      Method
                    </TableHead>
                    <TableHead className="text-primary-foreground text-center">
                      Date
                    </TableHead>
                    <TableHead className="text-primary-foreground text-center">
                      Amount
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {combinedPurchasePayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>{payment.name}</TableCell>
                      <TableCell className="text-center">
                        {payment.method}
                      </TableCell>
                      <TableCell className="text-center">
                        {format(new Date(payment.date), "dd MMM yyyy")}
                      </TableCell>
                      <TableCell className="text-center font-medium text-red-600">
                        {formatCurrency(payment.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <PaginationControls
                totalPages={purchaseTotalPages}
                hasNextPage={page < purchaseTotalPages}
                hasPrevPage={page > 1}
                totalCount={totalPurchaseCount}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
