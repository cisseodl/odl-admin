"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Line, LineChart } from "recharts"
import { Users, TrendingUp } from "lucide-react"

export function UserGrowthChart() {
  const data = [
    { month: "Jan", newUsers: 1200, totalUsers: 1200 },
    { month: "Fév", newUsers: 1500, totalUsers: 2700 },
    { month: "Mar", newUsers: 1800, totalUsers: 4500 },
    { month: "Avr", newUsers: 2100, totalUsers: 6600 },
    { month: "Mai", newUsers: 1900, totalUsers: 8500 },
    { month: "Juin", newUsers: 2300, totalUsers: 10800 },
  ]

  const totalGrowth = ((data[data.length - 1].totalUsers - data[0].totalUsers) / data[0].totalUsers) * 100
  const averageMonthly = data.reduce((sum, d) => sum + d.newUsers, 0) / data.length

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Croissance des Utilisateurs</CardTitle>
            <CardDescription>Évolution des inscriptions sur 6 mois</CardDescription>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Croissance totale</p>
              <p className="text-lg font-bold text-primary">+{totalGrowth.toFixed(1)}%</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Moyenne mensuelle</p>
              <p className="text-lg font-bold">{Math.round(averageMonthly).toLocaleString("fr-FR")}</p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            newUsers: {
              label: "Nouveaux utilisateurs",
              color: "hsl(var(--chart-1))",
            },
            totalUsers: {
              label: "Total utilisateurs",
              color: "hsl(var(--chart-2))",
            },
          }}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorNewUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-newUsers)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-newUsers)" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="colorTotalUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-totalUsers)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-totalUsers)" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="newUsers"
                stroke="var(--color-newUsers)"
                fill="url(#colorNewUsers)"
                name="Nouveaux"
              />
              <Area
                type="monotone"
                dataKey="totalUsers"
                stroke="var(--color-totalUsers)"
                fill="url(#colorTotalUsers)"
                name="Total"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
        <div className="mt-4 flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-[hsl(var(--chart-1))]" />
            <span className="text-muted-foreground">Nouveaux utilisateurs</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-[hsl(var(--chart-2))]" />
            <span className="text-muted-foreground">Total cumulé</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

