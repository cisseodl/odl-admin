"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface TopCoursesChartProps {
  data: { [courseTitle: string]: number }
}

export function TopCoursesChart({ data }: TopCoursesChartProps) {
  const chartData = Object.entries(data).map(([name, value]) => ({ name, Inscriptions: value })).sort((a, b) => b.Inscriptions - a.Inscriptions);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top 5 des cours par inscriptions</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="Inscriptions" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
