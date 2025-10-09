"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
  Rectangle,
} from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface SalesPurchaseGraphProps {
  salesData: Array<{ month: string; value: number }>
  purchaseData: Array<{ month: string; value: number }>
}

export default function DashboardCharts({
  salesData,
  purchaseData,
}: SalesPurchaseGraphProps) {
  const combinedData = salesData.map((salesItem) => {
    const purchaseItem = purchaseData.find((p) => p.month === salesItem.month)
    return {
      month: salesItem.month,
      sales: salesItem.value,
      purchases: purchaseItem?.value || 0,
    }
  })

  return (
    <Card className="shadow-md border border-border/50 bg-gradient-to-br from-indigo-50 via-white to-emerald-50">
      <CardHeader>
        <CardTitle>Monthly Sales & Purchases</CardTitle>
        <CardDescription>
          Comparison of sales and purchase trends over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-xl bg-white/60 p-3 backdrop-blur-sm">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={combinedData} barGap={6}>
              {/* Light grid lines */}
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

              {/* X & Y Axes */}
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12, fill: "#6b7280" }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#6b7280" }}
                tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
              />

              {/* Tooltip */}
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb",
                  boxShadow: "0px 2px 8px rgba(0,0,0,0.1)",
                }}
                formatter={(value: number, name: string) => [
                  `₹${value.toLocaleString()}`,
                  name === "sales" ? "Sales" : "Purchases",
                ]}
                labelFormatter={(label) => `Month: ${label}`}
              />

              {/* Legend */}
              <Legend
                wrapperStyle={{ paddingTop: "12px" }}
                iconType="circle"
                verticalAlign="bottom"
              />

              {/* Bars */}
              <Bar
                dataKey="sales"
                fill="#4f46e5"
                name="Sales"
                radius={[6, 6, 0, 0]}
                activeBar={<Rectangle fill="#6366f1" stroke="#4338ca" />}
              />
              <Bar
                dataKey="purchases"
                fill="#10b981"
                name="Purchases"
                radius={[6, 6, 0, 0]}
                activeBar={<Rectangle fill="#34d399" stroke="#059669" />}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
