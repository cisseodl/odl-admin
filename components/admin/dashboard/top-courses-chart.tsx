"use client"

import { useLanguage } from "@/contexts/language-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface TopCoursesChartProps {
  data: { [courseTitle: string]: number }
}

export function TopCoursesChart({ data }: TopCoursesChartProps) {
  const { t } = useLanguage()
  const enrollmentsKey = 'enrollments'
  const chartData = Object.entries(data).map(([name, value]) => ({ name, [enrollmentsKey]: value })).sort((a, b) => b[enrollmentsKey] - a[enrollmentsKey]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('dashboard.charts.top_courses.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" label={{ value: t('dashboard.charts.top_courses.enrollments_key'), position: 'insideBottom', offset: -5 }} />
            <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend formatter={() => t('dashboard.charts.top_courses.enrollments_key')} />
            <Bar dataKey={enrollmentsKey} fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
