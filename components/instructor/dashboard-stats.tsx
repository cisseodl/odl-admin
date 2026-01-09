"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageLoader } from "@/components/ui/page-loader"
import { BookOpen, Users, TrendingUp, Award, Star } from "lucide-react"
import { useEffect, useState } from "react"; // Added useState and useEffect
import { analyticsService, InstructorDashboardStats } from "@/services/analytics.service"; // Import analyticsService and InstructorDashboardStats type

export function InstructorDashboardStats() {
  const [summary, setSummary] = useState<InstructorDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await analyticsService.getInstructorDashboardStats(); // Utilisation de la méthode correcte
        setSummary(data);
      } catch (err: any) {
        if (err.message.includes("API Error 403")) {
          setError("Accès refusé. Vous n'êtes pas autorisé à voir ces statistiques.");
        } else if (err.message.includes("profil instructeur")) {
          setError("Vous n'avez pas encore de profil instructeur. Veuillez créer un profil instructeur pour accéder au tableau de bord.");
        } else {
          setError(err.message || "Échec de la récupération du résumé du tableau de bord.");
        }
        console.error("Error fetching dashboard summary:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  const stats = [
    {
      title: "Formations Créées",
      value: summary?.totalCoursesCreated !== undefined ? summary.totalCoursesCreated.toString() : "...",
      change: summary?.publishedCourses !== undefined ? `${summary.publishedCourses} publiées` : "...",
      icon: BookOpen,
      color: "text-[hsl(var(--info))]",
    },
    {
      title: "Total Apprenants",
      value: summary?.totalStudents !== undefined ? summary.totalStudents.toLocaleString("fr-FR") : "...",
      change: summary?.newEnrollmentsLast30Days !== undefined ? `+${summary.newEnrollmentsLast30Days} ce mois` : "...",
      icon: Users,
      color: "text-[hsl(var(--success))]",
    },
    {
      title: "Note Moyenne",
      value: summary?.averageRating !== undefined ? summary.averageRating.toFixed(1) : "...",
      change: summary?.newComments !== undefined ? `${summary.newComments} nouveaux avis (30j)` : "...",
      icon: Star,
      color: "text-[hsl(var(--info))]",
    },
    {
      title: "Taux de Complétion",
      value: summary?.averageCompletionRate !== undefined ? `${summary.averageCompletionRate.toFixed(1)}%` : "...",
      change: summary?.activeLearners !== undefined ? `${summary.activeLearners} apprenants actifs` : "...",
      icon: Award,
      color: "text-[hsl(var(--success))]",
    },
  ]


  if (loading) {
    return <PageLoader />;
  }

  if (error) {
    return <div className="text-center text-destructive p-4">{error}</div>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
            <stat.icon className={`h-5 w-5 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-[hsl(var(--success))]">{stat.change}</span>
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

