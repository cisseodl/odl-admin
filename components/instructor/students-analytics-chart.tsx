"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Line, LineChart, Pie, PieChart, Cell } from "recharts"
import { TrendingUp, Users, Award, BookOpen } from "lucide-react"

const progressionData = [
  { month: "Jan", actifs: 850, nouveaux: 120, complétés: 45 },
  { month: "Fév", actifs: 920, nouveaux: 145, complétés: 67 },
  { month: "Mar", actifs: 1050, nouveaux: 156, complétés: 89 },
  { month: "Avr", actifs: 1120, nouveaux: 134, complétés: 102 },
  { month: "Mai", actifs: 1180, nouveaux: 142, complétés: 115 },
  { month: "Juin", actifs: 1245, nouveaux: 156, complétés: 128 },
]

const scoreDistribution = [
  { range: "0-50%", count: 45 },
  { range: "51-60%", count: 78 },
  { range: "61-70%", count: 156 },
  { range: "71-80%", count: 234 },
  { range: "81-90%", count: 312 },
  { range: "91-100%", count: 420 },
]

const engagementData = [
  { day: "Lun", heures: 3.2, sessions: 145 },
  { day: "Mar", heures: 4.1, sessions: 178 },
  { day: "Mer", heures: 3.8, sessions: 162 },
  { day: "Jeu", heures: 4.5, sessions: 198 },
  { day: "Ven", heures: 5.2, sessions: 234 },
  { day: "Sam", heures: 2.8, sessions: 98 },
  { day: "Dim", heures: 1.9, sessions: 67 },
]

const completionByCourse = [
  { course: "React Avancé", complétés: 382, total: 450, taux: 85 },
  { course: "Node.js", complétés: 296, total: 380, taux: 78 },
  { course: "TypeScript", complétés: 245, total: 340, taux: 72 },
  { course: "Python", complétés: 312, total: 420, taux: 74 },
]

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"]

export function StudentsAnalyticsChart() {
  return (
    <Tabs defaultValue="progression" className="space-y-4">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="progression">Progression</TabsTrigger>
        <TabsTrigger value="scores">Scores</TabsTrigger>
        <TabsTrigger value="engagement">Engagement</TabsTrigger>
        <TabsTrigger value="completion">Complétion</TabsTrigger>
      </TabsList>

      <TabsContent value="progression" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Évolution des Apprenants
            </CardTitle>
            <CardDescription>Progression du nombre d'apprenants sur 6 mois</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                actifs: {
                  label: "Apprenants actifs",
                  color: "hsl(var(--chart-1))",
                },
                nouveaux: {
                  label: "Nouveaux apprenants",
                  color: "hsl(var(--chart-2))",
                },
                complétés: {
                  label: "Formations complétées",
                  color: "hsl(var(--chart-3))",
                },
              }}
              className="h-[350px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={progressionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="actifs"
                    stackId="1"
                    stroke="var(--color-actifs)"
                    fill="var(--color-actifs)"
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="nouveaux"
                    stackId="1"
                    stroke="var(--color-nouveaux)"
                    fill="var(--color-nouveaux)"
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="complétés"
                    stackId="1"
                    stroke="var(--color-complétés)"
                    fill="var(--color-complétés)"
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="scores" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Distribution des Scores
            </CardTitle>
            <CardDescription>Répartition des scores moyens des apprenants</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                count: {
                  label: "Nombre d'apprenants",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-[350px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scoreDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="var(--color-count)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="engagement" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Engagement Hebdomadaire
            </CardTitle>
            <CardDescription>Temps passé et nombre de sessions par jour de la semaine</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                heures: {
                  label: "Heures",
                  color: "hsl(var(--chart-1))",
                },
                sessions: {
                  label: "Sessions",
                  color: "hsl(var(--chart-2))",
                },
              }}
              className="h-[350px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={engagementData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="heures"
                    stroke="var(--color-heures)"
                    strokeWidth={3}
                    dot={{ r: 5 }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="sessions"
                    stroke="var(--color-sessions)"
                    strokeWidth={3}
                    dot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="completion" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Taux de Complétion par Formation
            </CardTitle>
            <CardDescription>Pourcentage de complétion et nombre d'apprenants par formation</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                complétés: {
                  label: "Complétés",
                  color: "hsl(var(--chart-1))",
                },
                total: {
                  label: "Total",
                  color: "hsl(var(--chart-2))",
                },
              }}
              className="h-[350px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={completionByCourse}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="course" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="complétés" fill="var(--color-complétés)" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="total" fill="var(--color-total)" radius={[8, 8, 0, 0]} opacity={0.5} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
            <div className="mt-4 space-y-2">
              {completionByCourse.map((course, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-lg border">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                    <span className="text-sm font-medium">{course.course}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">
                      {course.complétés}/{course.total}
                    </span>
                    <span className="text-sm font-bold">{course.taux}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}

