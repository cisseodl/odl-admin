"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Cell, LabelList } from "recharts"
import { Users, TrendingUp, Star } from "lucide-react" // Ajout de Star
import { useEffect, useState, useMemo } from "react"; // Ajout de useEffect, useState, useMemo
import { analyticsService, CoursePerformanceDataPoint } from "@/services/analytics.service"; // Import service et type
import { PageLoader } from "@/components/ui/page-loader"; // Import PageLoader


type TimeFilter = "7d" | "30d" | "90d" | "custom" | "all"; // Type pour le filtre temporel

interface CoursePerformanceProps {
  timeFilter: TimeFilter;
  startDate?: string;
  endDate?: string;
}

export function CoursePerformance({ timeFilter, startDate, endDate }: CoursePerformanceProps) {
  const [data, setData] = useState<CoursePerformanceDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCoursePerformance = async () => {
      setLoading(true);
      setError(null);
      try {
        // Utiliser une valeur par défaut si timeFilter est undefined
        const filter = timeFilter || "30d";
        const fetchedData = await analyticsService.getCoursePerformanceData(filter, startDate, endDate);
        setData(fetchedData.sort((a, b) => b.enrollments - a.enrollments)); // Trier par nombre d'inscriptions (enrollments)
      } catch (err: any) {
        setError(err.message || "Failed to fetch course performance data.");
        console.error("Error fetching course performance data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCoursePerformance();
  }, [timeFilter, startDate, endDate]); // Re-fetch quand les filtres changent


  // Calculs dynamiques basés sur les données chargées
  const totalStudents = useMemo(() => {
    return data.reduce((sum, d) => sum + d.enrollments, 0);
  }, [data]);

  const maxValue = useMemo(() => {
    return data.length > 0 ? Math.max(...data.map((d) => d.enrollments)) : 0;
  }, [data]);

  const mostPopularCourse = useMemo(() => {
    return data.length > 0 ? data.reduce((prev, current) => (prev.enrollments > current.enrollments ? prev : current)).courseTitle : "N/A";
  }, [data]);


  // Format personnalisé pour les valeurs
  const formatValue = (value: number) => {
    return value.toLocaleString("fr-FR")
  }

  if (loading) {
    return <PageLoader />;
  }

  if (error) {
    return <div className="text-center text-destructive p-4">{error}</div>;
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
            <span className="text-muted-foreground">Total: {totalStudents.toLocaleString("fr-FR")}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="text-center text-muted-foreground p-4">Aucune donnée de performance de cours disponible pour la période.</div>
        ) : (
          <ChartContainer
            config={{
              enrollments: { // Changé de 'students' à 'enrollments'
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
                  {/* Utilisation d'un gradient unique ou adapté si les couleurs sont dynamiques */}
                  <linearGradient id="colorEnrollments" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="var(--color-enrollments)" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="var(--color-enrollments)" stopOpacity={0.4} />
                  </linearGradient>
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
                  dataKey="courseTitle" // Changé de 'course' à 'courseTitle'
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
                          <div className="font-semibold mb-2">{data.courseTitle}</div>
                          <div className="flex items-center gap-2 text-sm">
                            <div className="h-3 w-3 rounded-full bg-[hsl(var(--chart-2))]" />
                            <span className="text-muted-foreground">Étudiants:</span>
                            <span className="font-bold">{formatValue(data.enrollments)}</span> {/* Changé de 'students' à 'enrollments' */}
                          </div>
                          <div className="flex items-center gap-2 text-sm mt-1">
                            <span className="text-muted-foreground">Taux de complétion:</span>
                            <span className="font-bold">{data.completionRate.toFixed(1)}%</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm mt-1">
                            <span className="text-muted-foreground">Note moyenne:</span>
                            <span className="font-bold">{data.averageRating.toFixed(1)} <Star className="inline-block h-3 w-3 fill-yellow-400 text-yellow-400" /></span>
                          </div>
                        </div>
                      )
                    }
                    return null
                  }}
                  cursor={{ fill: "hsl(var(--accent))", opacity: 0.1 }}
                />
                <Bar
                  dataKey="enrollments" // Changé de 'students' à 'enrollments'
                  fill="url(#colorEnrollments)" // Utilisation du gradient unique
                  radius={[0, 8, 8, 0]}
                  animationDuration={1000}
                  animationBegin={0}
                >
                  <LabelList
                    dataKey="enrollments" // Changé de 'students' à 'enrollments'
                    position="right"
                    formatter={formatValue}
                    style={{ fill: "hsl(var(--foreground))", fontSize: 12, fontWeight: 500 }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-[hsl(var(--chart-1))]" />
                <span className="text-muted-foreground">Formation la plus populaire: {mostPopularCourse}</span>
              </div>
            </div>
            {/* Vous pourriez calculer une croissance moyenne réelle ici si les données d'historique sont disponibles */}
            {/* <div className="flex items-center gap-2 text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span>Croissance moyenne: +10%</span>
            </div> */}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

