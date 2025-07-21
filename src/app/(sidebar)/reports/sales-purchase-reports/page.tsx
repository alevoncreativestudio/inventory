import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";

export default async function PurchaseSaleSummaryPage() {
  const purchases = await prisma.purchase.findMany({
    select: { totalAmount: true, dueAmount: true },
  });

  const sales = await prisma.sale.findMany({
    select: { grandTotal: true, dueAmount: true },
  });

  const purchaseReturns = await prisma.purchaseReturn.findMany({
    select: { totalAmount: true },
  });

  const salesReturns = await prisma.salesReturn.findMany({
    select: { grandTotal: true },
  });

  const totalPurchase = purchases.reduce((sum, p) => sum + p.totalAmount, 0);
  const totalPurchaseDue = purchases.reduce((sum, p) => sum + p.dueAmount, 0);
  const totalPurchaseReturn = purchaseReturns.reduce((sum, r) => sum + r.totalAmount, 0);

  const totalSales = sales.reduce((sum, s) => sum + s.grandTotal, 0);
  const totalSalesDue = sales.reduce((sum, s) => sum + s.dueAmount, 0);
  const totalSalesReturn = salesReturns.reduce((sum, r) => sum + r.grandTotal, 0);

  const netProfit = (totalSales - totalSalesReturn) - (totalPurchase - totalPurchaseReturn);
  const totalDueAmount = totalPurchaseDue - totalSalesDue;

  return (

      <div>
        <div className="my-4">
        <h1 className="text-2xl font-bold tracking-tight">Sales and Purchase Report</h1>
        </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Purchases</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total Purchase(inc Tax):</span>
                    <span>{formatCurrency(totalPurchase)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Purchase Return:</span>
                    <span>{formatCurrency(totalPurchaseReturn)}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Purchase Due:</span>
                    <span>{formatCurrency(totalPurchaseDue)}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Sales</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total Sale(inc Tax):</span>
                    <span>{formatCurrency(totalSales)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sales Return:</span>
                    <span>{formatCurrency(totalSalesReturn)}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Sale Due:</span>
                    <span>{formatCurrency(totalSalesDue)}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="col-span-1 lg:col-span-2">
                <CardContent className=" py-6 space-y-4">
                  <div className="text-lg">
                    <div className="font-semibold">Overall ((Sale - Sale Return) - (Purchase - Purchase Return)): </div>
                  </div>
                  <div className="text-lg">
                    <span className="font-semibold">Sale - Purchase: </span>
                    <span className={`font-bold ${netProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {formatCurrency(netProfit)}
                    </span>
                  </div>

                  <div className="text-lg">
                    <span className="font-semibold">Due Amount: </span>
                    <span className="text-red-600 font-bold">{formatCurrency(totalDueAmount)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
      </div>
            
  );
}
