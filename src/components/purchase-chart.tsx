"use client";

import { useEffect, useState } from "react";
import { Bar, BarChart } from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";
import { ChartConfig, ChartContainer ,ChartTooltip, ChartTooltipContent} from "@/components/ui/chart";
import { getPurchaseList } from "@/actions/purchase-actions";
import { groupPurchasesByMonth } from "@/lib/utils";

const chartConfig = {
  value: {
    label: "Total Purchase",
    color: "#3b82f6",
  },
} satisfies ChartConfig;

interface GraphData {
  month: string;
  value: number;
}

export function PurchaseGraph() {
  const [data, setData] = useState<GraphData[]>([]);

useEffect(() => {
  const fetchData = async () => {
    const res = await getPurchaseList();

    if (res?.data?.purchases && Array.isArray(res.data.purchases)) {
      const validData = res.data.purchases.map((p) => ({
        purchaseDate: p.purchaseDate,
        totalAmount: p.totalAmount,
      }));

      const grouped = groupPurchasesByMonth(validData);
      setData(grouped);
    }
  };

  fetchData();
}, []);


  return (
    <Card className="bg-gradient-to-t from-primary/5 to-card shadow-sm">
      <CardHeader className="pb-2">
        <CardDescription>Monthly overview</CardDescription>
        <CardTitle className="text-2xl font-semibold">Total Purchases</CardTitle>
      </CardHeader>

      <CardContent className="pt-4">
        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
          <BarChart accessibilityLayer data={data}>
            <Bar dataKey="value" fill="var(--color-value)" radius={4} />
            <ChartTooltip content={<ChartTooltipContent />} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="text-sm text-muted-foreground">
        Purchases grouped by month
      </CardFooter>
    </Card>
  );
}
