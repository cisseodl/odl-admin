"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"

interface UsersByRoleChartProps {
  data: { [role: string]: number }
}

const COLORS = {
  LEARNER: "#0088FE",
  INSTRUCTOR: "#00C49F",
  ADMIN: "#FFBB28",
}

export function UsersByRoleChart({ data }: UsersByRoleChartProps) {
  const chartData = Object.entries(data).map(([name, value]) => ({ name, value }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Répartition des utilisateurs par rôle</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS] || "#8884d8"} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
