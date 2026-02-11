"use client"

import { useLanguage } from "@/contexts/language-context"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Legend } from "recharts"
import { BookOpen } from "lucide-react"
import { useEffect, useState, useMemo } from "react"
import { useAuth } from "@/contexts/auth-context"
import { fetchApi } from "@/services/api.service"
import { PageLoader } from "@/components/ui/page-loader"
import { format, parse } from "date-fns"
import { fr } from "date-fns/locale"

export function CoursePerformanceChart() {
  const { t } = useLanguage()
  const { user } = useAuth()
  const [monthlyData, setMonthlyData] = useState<Array<Record<string, any>>>([])
  const [courses, setCourses] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        // Utiliser le nouvel endpoint pour récupérer les performances par mois
        const response = await fetchApi<{ data: Array<Record<string, any>> }>(
          `/api/analytics/instructor-dashboard-performance-by-month?instructorId=${user.id}`,
          { method: 'GET' }
        )
        
        const data = response.data || []
        if (data.length > 0) {
          // Extraire la liste des cours (toutes les clés sauf "month" et "monthKey")
          const courseNames = new Set<string>()
          data.forEach((month: Record<string, any>) => {
            Object.keys(month).forEach(key => {
              if (key !== "month" && key !== "monthKey") {
                courseNames.add(key)
              }
            })
          })
          const newCourses = Array.from(courseNames).sort() // Trier pour stabilité
          // Ne mettre à jour que si le contenu a changé (comparaison par valeur)
          setCourses(prev => {
            const prevStr = JSON.stringify(prev.sort())
            const newStr = JSON.stringify(newCourses)
            if (prevStr !== newStr) {
              return newCourses
            }
            return prev
          })
        } else {
          setCourses([])
        }
        
        setMonthlyData(data)
      } catch (err) {
        console.error("Error fetching course performance by month:", err)
        setMonthlyData([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user?.id])

  // Transformer les données pour le graphique
  const chartData = useMemo(() => {
    if (!monthlyData || monthlyData.length === 0 || !courses || courses.length === 0) return []
    
    return monthlyData.map((month: Record<string, any>) => {
      const dataPoint: Record<string, any> = {
        month: month.month || month.monthKey || "",
        monthKey: month.monthKey || "",
      }
      
      // Ajouter les notes de chaque cours
      courses.forEach(courseName => {
        dataPoint[courseName] = month[courseName] || 0
      })
      
      return dataPoint
    })
  }, [monthlyData, courses])

  if (loading) {
    return <PageLoader />
  }

  if (chartData.length === 0 || courses.length === 0) {
    return (
      <div className="text-center text-muted-foreground p-4">
        {t('instructor.analytics.performance.no_data')}
      </div>
    )
  }

  // Configuration des couleurs pour chaque cours (tous en vert)
  const chartConfig = useMemo(() => {
    if (!courses || courses.length === 0) return {}
    const config: Record<string, { label?: string; color?: string }> = {}
    courses.forEach(course => {
      config[course] = {
        label: course,
        color: "hsl(var(--success))"
      }
    })
    return config
  }, [courses])

  return (
    <div className="w-full space-y-4">
      <ChartContainer
        config={chartConfig}
        className="h-[400px] w-full"
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 20, right: 80, left: 150, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis
              type="number"
              domain={[0, 5]}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              tickLine={{ stroke: "hsl(var(--border))" }}
              axisLine={{ stroke: "hsl(var(--border))" }}
              label={{ value: t('instructor.analytics.performance.rating') || "Note", position: 'insideBottom', offset: -5 }}
            />
            <YAxis
              type="category"
              dataKey="month"
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              tickLine={{ stroke: "hsl(var(--border))" }}
              axisLine={{ stroke: "hsl(var(--border))" }}
              width={140}
            />
            <ChartTooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-lg border bg-card p-3 shadow-md">
                      <p className="font-semibold mb-2">{payload[0].payload.month}</p>
                      {payload.map((entry: any, index: number) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <BookOpen className="h-4 w-4 text-primary" />
                          <span className="text-muted-foreground">{entry.name}:</span>
                          <span className="font-bold text-foreground">{Number(entry.value).toFixed(1)} / 5 ⭐</span>
                        </div>
                      ))}
                    </div>
                  )
                }
                return null
              }}
            />
            <Legend
              formatter={(value) => {
                // Tronquer les noms de cours longs
                return value.length > 20 ? value.substring(0, 20) + "..." : value
              }}
            />
            {courses.map((courseName) => (
              <Bar
                key={courseName}
                dataKey={courseName}
                name={courseName}
                fill="hsl(var(--success))"
                radius={[0, 4, 4, 0]}
                barSize={20}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {courses.map((courseName, index) => {
          // Calculer la note moyenne globale pour ce cours
          const totalRating = chartData.reduce((sum, month) => sum + (month[courseName] || 0), 0)
          const monthsWithRating = chartData.filter(month => (month[courseName] || 0) > 0).length
          const averageRating = monthsWithRating > 0 ? totalRating / monthsWithRating : 0
          
          return (
            <div
              key={courseName}
              className="flex items-center gap-2 p-2 rounded-lg border bg-card/50 hover:bg-card transition-colors"
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: "hsl(var(--success))" }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{courseName.length > 20 ? courseName.substring(0, 20) + "..." : courseName}</p>
                <p className="text-xs text-muted-foreground">{averageRating.toFixed(1)} / 5 ⭐</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

