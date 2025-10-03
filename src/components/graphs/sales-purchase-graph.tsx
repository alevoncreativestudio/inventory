"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface SalesPurchaseGraphProps {
  salesData: Array<{ month: string; value: number }>
  purchaseData: Array<{ month: string; value: number }>
}

export default function DashboardCharts({ salesData, purchaseData }: SalesPurchaseGraphProps) {
  // Combine sales and purchase data by month
  const combinedData = salesData.map(salesItem => {
    const purchaseItem = purchaseData.find(p => p.month === salesItem.month)
    return {
      month: salesItem.month,
      sales: salesItem.value,
      purchases: purchaseItem?.value || 0,
    }
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Sales & Purchases</CardTitle>
        <CardDescription>
          Comparison of sales and purchase trends over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={combinedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="month" 
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip 
              formatter={(value: number, name: string) => [
                `₹${value.toLocaleString()}`, 
                name === 'sales' ? 'Sales' : 'Purchases'
              ]}
              labelFormatter={(label) => `Month: ${label}`}
            />
            <Legend />
            <Bar 
              dataKey="sales" 
              fill="hsl(var(--chart-1))" 
              name="Sales"
              radius={[2, 2, 0, 0]}
            />
            <Bar 
              dataKey="purchases" 
              fill="hsl(var(--chart-2))" 
              name="Purchases"
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
