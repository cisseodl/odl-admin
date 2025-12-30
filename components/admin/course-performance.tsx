"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Cell, LabelList } from "recharts"
import { Users, TrendingUp } from "lucide-react"

export function CoursePerformance() {
  const data = [
    { course: "JavaScript", students: 620, change: "+12%" },
    { course: "Python", students: 520, change: "+8%" },
    { course: "React", students: 450, change: "+15%" },
    { course: "Node.js", students: 380, change: "+5%" },
    { course: "TypeScript", students: 340, change: "+10%" },
  ]

  // Couleurs avec gradient pour chaque barre
  const colors = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ]

  const maxValue = Math.max(...data.map((d) => d.students))

  // Format personnalisé pour les valeurs
  const formatValue = (value: number) => {
    return value.toLocaleString("fr-FR")
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-semibold leading-tight">Top Formations</CardTitle>
            <CardDescription className="text-sm leading-relaxed">
              Nombre d'étudiants inscrits par formation
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Total: {data.reduce((sum, d) => sum + d.students, 0).toLocaleString("fr-FR")}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            students: {
              label: "Étudiants",
              color: "hsl(var(--chart-2))",
            },
          }}
          className="h-[350px] w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 20, right: 30, left: 100, bottom: 20 }}
            >
              <defs>
                {colors.map((color, index) => (
                  <linearGradient key={index} id={`gradient-${index}`} x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor={color} stopOpacity={0.8} />
                    <stop offset="100%" stopColor={color} stopOpacity={0.4} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="hsl(var(--border))" 
                horizontal={true}
                vertical={false}
              />
              <XAxis
                type="number"
                domain={[0, maxValue * 1.1]}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                axisLine={{ stroke: "hsl(var(--border))" }}
                tickLine={{ stroke: "hsl(var(--border))" }}
                tickFormatter={formatValue}
              />
              <YAxis
                dataKey="course"
                type="category"
                width={90}
                tick={{ fill: "hsl(var(--foreground))", fontSize: 13, fontWeight: 500 }}
                axisLine={{ stroke: "hsl(var(--border))" }}
                tickLine={{ stroke: "hsl(var(--border))" }}
              />
              <ChartTooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload
                    return (
                      <div className="rounded-lg border bg-background p-3 shadow-lg">
                        <div className="font-semibold mb-2">{data.course}</div>
                        <div className="flex items-center gap-2 text-sm">
                          <div className="h-3 w-3 rounded-full bg-[hsl(var(--chart-2))]" />
                          <span className="text-muted-foreground">Étudiants:</span>
                          <span className="font-bold">{formatValue(data.students)}</span>
                        </div>
                        {data.change && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {data.change} vs mois dernier
                          </div>
                        )}
                      </div>
                    )
                  }
                  return null
                }}
                cursor={{ fill: "hsl(var(--accent))", opacity: 0.1 }}
              />
              <Bar
                dataKey="students"
                radius={[0, 8, 8, 0]}
                animationDuration={1000}
                animationBegin={0}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={`url(#gradient-${index})`} />
                ))}
                <LabelList
                  dataKey="students"
                  position="right"
                  formatter={formatValue}
                  style={{ fill: "hsl(var(--foreground))", fontSize: 12, fontWeight: 500 }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-[hsl(var(--chart-1))]" />
                <span className="text-muted-foreground">Formation la plus populaire</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span>Croissance moyenne: +10%</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
