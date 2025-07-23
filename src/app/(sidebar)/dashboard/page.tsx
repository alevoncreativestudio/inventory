import { PurchaseGraph } from "@/components/purchase-chart";
import { SalesGraph } from "@/components/sales-chart";

export default function Dashboard() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="grid grid-cols-1 gap-4 py-4 md:grid-cols-2 md:gap-6 md:py-6">
          <PurchaseGraph />
          <SalesGraph />
        </div>
      </div>
    </div>
  );
}
