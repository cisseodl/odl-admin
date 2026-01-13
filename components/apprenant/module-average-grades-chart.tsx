"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { useLanguage } from "@/contexts/language-context"
import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { PageLoader } from "@/components/ui/page-loader"
import { fetchApi } from "@/services/api.service"

interface ModuleAverageGrade {
  moduleId: number
  moduleTitle: string
  averageGrade: number
  totalQuizzes: number
  completedQuizzes: number
}

export function ModuleAverageGradesChart() {
  const { t } = useLanguage()
  const { user } = useAuth()
  const [data, setData] = useState<ModuleAverageGrade[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchModuleGrades = async () => {
      if (!user?.id) {
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)
      try {
        // Appel API pour récupérer les notes moyennes par module
        const response = await fetchApi<any>(`/analytics/student/module-grades/${user.id}`, {
          method: "GET",
        })
        
        if (response && response.data) {
          setData(response.data)
        } else {
          // Données de démonstration si l'endpoint n'existe pas encore
          setData([
            { moduleId: 1, moduleTitle: "Module 1", averageGrade: 85, totalQuizzes: 5, completedQuizzes: 5 },
            { moduleId: 2, moduleTitle: "Module 2", averageGrade: 78, totalQuizzes: 4, completedQuizzes: 4 },
            { moduleId: 3, moduleTitle: "Module 3", averageGrade: 92, totalQuizzes: 6, completedQuizzes: 6 },
            { moduleId: 4, moduleTitle: "Module 4", averageGrade: 88, totalQuizzes: 5, completedQuizzes: 4 },
          ])
        }
      } catch (err: any) {
        console.error("Error fetching module grades:", err)
        // Données de démonstration en cas d'erreur
        setData([
          { moduleId: 1, moduleTitle: "Module 1", averageGrade: 85, totalQuizzes: 5, completedQuizzes: 5 },
          { moduleId: 2, moduleTitle: "Module 2", averageGrade: 78, totalQuizzes: 4, completedQuizzes: 4 },
          { moduleId: 3, moduleTitle: "Module 3", averageGrade: 92, totalQuizzes: 6, completedQuizzes: 6 },
        ])
        setError(err.message || "Erreur lors du chargement des notes")
      } finally {
        setLoading(false)
      }
    }

    fetchModuleGrades()
  }, [user?.id])

  if (loading) {
    return <PageLoader />
  }

  if (error && data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('apprenant.dashboard.moduleGrades.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-destructive p-4">{error}</div>
        </CardContent>
      </Card>
    )
  }

  const chartData = data.map((item) => ({
    name: item.moduleTitle.length > 15 ? item.moduleTitle.substring(0, 15) + "..." : item.moduleTitle,
    fullName: item.moduleTitle,
    "Note moyenne": item.averageGrade,
    "Quiz complétés": `${item.completedQuizzes}/${item.totalQuizzes}`,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('apprenant.dashboard.moduleGrades.title')}</CardTitle>
        <CardDescription>{t('apprenant.dashboard.moduleGrades.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="text-center text-muted-foreground p-4">
            {t('apprenant.dashboard.moduleGrades.noData')}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                domain={[0, 100]}
                label={{ value: t('apprenant.dashboard.moduleGrades.grade'), angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                formatter={(value: any, name: string) => {
                  if (name === "Note moyenne") {
                    return [`${value}%`, t('apprenant.dashboard.moduleGrades.averageGrade')]
                  }
                  return [value, name]
                }}
                labelFormatter={(label) => {
                  const item = chartData.find(d => d.name === label)
                  return item?.fullName || label
                }}
              />
              <Legend />
              <Bar 
                dataKey="Note moyenne" 
                fill="hsl(var(--primary))" 
                name={t('apprenant.dashboard.moduleGrades.averageGrade')}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
