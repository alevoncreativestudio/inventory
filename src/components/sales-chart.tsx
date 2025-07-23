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
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { getSalesList } from "@/actions/sales-action";
import { groupSalesByMonth } from "@/lib/utils";

const chartConfig = {
  value: {
    label: "Total Sales",
    color: "#22c55e", // Tailwind green-500
  },
} satisfies ChartConfig;

interface GraphData {
  month: string;
  value: number;
}

export function SalesGraph() {
  const [data, setData] = useState<GraphData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const salesRes = await getSalesList();

      if (salesRes?.data?.sales && Array.isArray(salesRes.data.sales)) {
        const validData = salesRes.data.sales.map((s) => ({
          saleDate: s.salesdate,
          grandTotal: s.grandTotal,
        }));

        const grouped = groupSalesByMonth(validData);
        setData(grouped);
      }
    };

    fetchData();
  }, []);

  return (
    <Card className=" bg-gradient-to-t from-green-50 to-card shadow-sm">
      <CardHeader className="pb-2">
        <CardDescription>Monthly overview</CardDescription>
        <CardTitle className="text-2xl font-semibold">Total Sales</CardTitle>
      </CardHeader>

      <CardContent className="pt-4">
        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
          <BarChart accessibilityLayer data={data}>
            <Bar dataKey="value" fill="var(--color-value)" radius={4} />
            <ChartTooltip content={<ChartTooltipContent/>} />
          </BarChart>
        </ChartContainer>
      </CardContent>

      <CardFooter className="text-sm text-muted-foreground">
        Sales grouped by month
      </CardFooter>
    </Card>
  );
}
