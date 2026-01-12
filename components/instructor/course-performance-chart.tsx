"use client"

import { useLanguage } from "@/contexts/language-context"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts"
import { BookOpen } from "lucide-react"
import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { fetchApi } from "@/services/api.service"
import { PageLoader } from "@/components/ui/page-loader"

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
]

export function CoursePerformanceChart() {
  const { t } = useLanguage()
  const { user } = useAuth()
  const [data, setData] = useState<Array<{ course: string; students: number; label: string }>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        // Utiliser l'endpoint pour récupérer les performances des cours de l'instructeur
        const response = await fetchApi<{ data: Array<{ courseId: number; courseTitle: string; studentsCount: number }> }>(
          `/api/analytics/instructor-dashboard-performance?instructorId=${user.id}`,
          { method: 'GET' }
        )
        
        const courseData = response.data || []
        // Filtrer uniquement les cours qui ont des étudiants inscrits (studentsCount > 0)
        const mappedData = courseData
          .filter((item: any) => (item.studentsCount || 0) > 0)
          .map((item: any) => ({
            course: item.courseTitle || `Cours ${item.courseId}`,
            students: item.studentsCount || 0,
            label: (item.courseTitle || `Cours ${item.courseId}`).substring(0, 10),
          }))
        
        setData(mappedData)
      } catch (err) {
        console.error("Error fetching course performance:", err)
        setData([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user?.id])

  if (loading) {
    return <PageLoader />
  }

  if (data.length === 0) {
    return (
      <div className="text-center text-muted-foreground p-4">
        {t('instructor.analytics.performance.no_data')}
      </div>
    )
  }

  return (
    <div className="w-full space-y-4">
      <ChartContainer
        config={{
          students: {
            label: t('instructor.analytics.performance.students_label'),
            color: "hsl(var(--chart-1))",
          },
        }}
        className="h-[280px] w-full"
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            barCategoryGap="20%"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis
              dataKey="label"
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              tickLine={{ stroke: "hsl(var(--border))" }}
              axisLine={{ stroke: "hsl(var(--border))" }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              tickLine={{ stroke: "hsl(var(--border))" }}
              axisLine={{ stroke: "hsl(var(--border))" }}
            />
            <ChartTooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-lg border bg-card p-3 shadow-md">
                      <div className="flex items-center gap-2 mb-1">
                        <BookOpen className="h-4 w-4 text-primary" />
                        <p className="font-semibold">{payload[0].payload.course}</p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">{payload[0].value}</span> {t('instructor.analytics.performance.learners')}
                      </p>
                    </div>
                  )
                }
                return null
              }}
            />
            <Bar
              dataKey="students"
              radius={[8, 8, 0, 0]}
              animationDuration={800}
              animationBegin={0}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {data.map((item, index) => (
          <div
            key={item.course}
            className="flex items-center gap-2 p-2 rounded-lg border bg-card/50 hover:bg-card transition-colors"
          >
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">{item.label}</p>
              <p className="text-xs text-muted-foreground">{item.students} {t('instructor.analytics.performance.learners')}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

