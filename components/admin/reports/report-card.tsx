"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Download, FileText, Calendar } from "lucide-react"
import { PDFGenerator } from "@/lib/reports/pdf-generator"
import { ExcelGenerator } from "@/lib/reports/excel-generator"
import { analyticsService, type AnalyticsMetrics, type LearningTimeMetrics } from "@/services/analytics.service"
import { courseService } from "@/services/course.service"
import type { LucideIcon } from "lucide-react"

type Period = "week" | "month" | "quarter" | "year" | "custom"

type ReportType = {
  id: string
  title: string
  description: string
  icon: LucideIcon
  color: string
}

type ReportCardProps = {
  reportType: ReportType
}

export function ReportCard({ reportType }: ReportCardProps) {
  const [period, setPeriod] = useState<Period>("month")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [analyticsData, setAnalyticsData] = useState<AnalyticsMetrics | null>(null)
  const [learningTimeData, setLearningTimeData] = useState<LearningTimeMetrics | null>(null)
  const [coursesData, setCoursesData] = useState<any[]>([])

  const Icon = reportType.icon

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (reportType.id === "learning-time") {
          const data = await analyticsService.getLearningTimeMetrics()
          setLearningTimeData(data)
        } else if (reportType.id === "users") {
          const data = await analyticsService.getAnalyticsMetrics()
          setAnalyticsData(data)
        } else if (reportType.id === "courses") {
          const data = await courseService.getAllCourses()
          setCoursesData(Array.isArray(data) ? data : (data?.data || []))
        }
      } catch (error) {
        console.error(`Error fetching data for ${reportType.id}:`, error)
      }
    }
    fetchData()
  }, [reportType.id])

  const getPeriodLabel = (period: Period): string => {
    switch (period) {
      case "week":
        return "Cette semaine"
      case "month":
        return "Ce mois"
      case "quarter":
        return "Ce trimestre"
      case "year":
        return "Cette année"
      case "custom":
        return "Personnalisée"
      default:
        return ""
    }
  }

  const generateReportData = () => {
    // Générer des données de rapport dynamiques selon le type
    const baseData = {
      period: getPeriodLabel(period),
      generatedAt: new Date().toLocaleString("fr-FR"),
      startDate: period === "custom" ? startDate : "",
      endDate: period === "custom" ? endDate : "",
    }

    switch (reportType.id) {
      case "learning-time":
        return {
          ...baseData,
          metrics: {
            averageTimePerCourse: learningTimeData 
              ? `${Math.round(learningTimeData.averageTimePerCourseMinutes)} min`
              : "0 min",
            activeSessions: learningTimeData 
              ? learningTimeData.activeSessions.toLocaleString("fr-FR")
              : "0",
            averageTimePerLearner: learningTimeData 
              ? `${Math.round(learningTimeData.averageTimePerLearnerMinutes)} min`
              : "0 min",
            coursesWithActivity: learningTimeData 
              ? learningTimeData.coursesWithActivity.toString()
              : "0",
            learnersWithActivity: learningTimeData 
              ? learningTimeData.learnersWithActivity.toString()
              : "0",
          },
          details: [
            { label: "Temps moyen par cours", value: learningTimeData ? `${Math.round(learningTimeData.averageTimePerCourseMinutes)} min` : "0 min" },
            { label: "Sessions actives (24h)", value: learningTimeData ? learningTimeData.activeSessions.toLocaleString("fr-FR") : "0" },
            { label: "Temps moyen par apprenant", value: learningTimeData ? `${Math.round(learningTimeData.averageTimePerLearnerMinutes)} min` : "0 min" },
            { label: "Cours avec activité", value: learningTimeData ? learningTimeData.coursesWithActivity.toString() : "0" },
            { label: "Apprenants avec activité", value: learningTimeData ? learningTimeData.learnersWithActivity.toString() : "0" },
          ],
        }
      case "users":
        return {
          ...baseData,
          metrics: {
            totalUsers: analyticsData ? analyticsData.totalUsers.toLocaleString("fr-FR") : "0",
            activeUsers: analyticsData ? analyticsData.activeUsers.toLocaleString("fr-FR") : "0",
            engagementRate: analyticsData ? `${analyticsData.engagementRate.toFixed(1)}%` : "0%",
            averageRating: analyticsData ? `${analyticsData.averageRating.toFixed(1)}/5` : "0/5",
          },
          details: [
            { label: "Total utilisateurs", value: analyticsData ? analyticsData.totalUsers.toLocaleString("fr-FR") : "0" },
            { label: "Utilisateurs actifs", value: analyticsData ? analyticsData.activeUsers.toLocaleString("fr-FR") : "0" },
            { label: "Taux d'engagement", value: analyticsData ? `${analyticsData.engagementRate.toFixed(1)}%` : "0%" },
            { label: "Note moyenne", value: analyticsData ? `${analyticsData.averageRating.toFixed(1)}/5` : "0/5" },
            { label: "Total avis", value: analyticsData ? analyticsData.totalReviews.toLocaleString("fr-FR") : "0" },
          ],
        }
      case "courses":
        const totalCourses = coursesData.length
        const publishedCourses = coursesData.filter((c: any) => c.status === "PUBLIE" || c.status === "PUBLISHED").length
        const totalEnrollments = coursesData.reduce((sum: number, c: any) => sum + (c.enrolledCount || 0), 0)
        const avgRating = coursesData.length > 0
          ? (coursesData.reduce((sum: number, c: any) => sum + (c.rating || 0), 0) / coursesData.length).toFixed(1)
          : "0"
        const topCourse = coursesData.length > 0
          ? coursesData.sort((a: any, b: any) => (b.enrolledCount || 0) - (a.enrolledCount || 0))[0]
          : null
        
        return {
          ...baseData,
          metrics: {
            totalCourses: totalCourses.toString(),
            publishedCourses: publishedCourses.toString(),
            totalEnrollments: totalEnrollments.toLocaleString("fr-FR"),
            averageRating: `${avgRating}/5`,
            popularCourse: topCourse?.title || "N/A",
          },
          details: [
            { label: "Total formations", value: totalCourses.toString() },
            { label: "Formations publiées", value: publishedCourses.toString() },
            { label: "Total inscriptions", value: totalEnrollments.toLocaleString("fr-FR") },
            { label: "Note moyenne", value: `${avgRating}/5` },
            { label: "Formation la plus populaire", value: topCourse?.title || "N/A" },
            { label: "Inscriptions (formation populaire)", value: topCourse ? (topCourse.enrolledCount || 0).toLocaleString("fr-FR") : "0" },
          ],
        }
      default:
        return baseData
    }
  }

  const handleGenerate = async () => {
    setIsGenerating(true)
    try {
      const data = generateReportData()
      console.log(`Génération du rapport ${reportType.title}:`, data)
      
      // Simuler un délai de génération
      await new Promise((resolve) => setTimeout(resolve, 1000))
      
      // Afficher un aperçu ou télécharger directement
      alert(`Rapport ${reportType.title} généré avec succès!\n\nPériode: ${data.period}\nGénéré le: ${data.generatedAt}`)
    } catch (error) {
      console.error("Erreur lors de la génération:", error)
      alert("Une erreur est survenue lors de la génération du rapport")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleExportPDF = async () => {
    try {
      const data = generateReportData()
      const reportData = {
        title: reportType.title,
        description: reportType.description,
        period: getPeriodLabel(period),
        generatedAt: new Date().toLocaleString("fr-FR"),
        details: data.details || [],
        metadata: data.metrics || {},
      }

      PDFGenerator.generate({
        title: reportData.title,
        content: `
          <h2>Description</h2>
          <p>${reportData.description}</p>
          <h2>Résumé des Métriques</h2>
          <p>Ce rapport présente les métriques clés pour la période: <strong>${reportData.period}</strong></p>
        `,
        metadata: {
          "Période": reportData.period,
          ...Object.fromEntries(
            reportData.details.slice(0, 4).map(d => [d.label, d.value])
          )
        },
        tables: [
          {
            headers: ["Métrique", "Valeur"],
            rows: reportData.details.map((d) => [d.label, d.value]),
          },
        ],
      })
    } catch (error) {
      console.error("Erreur lors de l'export PDF:", error)
      alert("Une erreur est survenue lors de l'export PDF")
    }
  }

  const handleExportExcel = async () => {
    try {
      const data = generateReportData()
      
      // Transformer les données en format horizontal (en-têtes en ligne, valeurs en colonnes)
      // Format: { "Métrique 1": "Valeur 1", "Métrique 2": "Valeur 2", ... }
      const horizontalData = (data.details || []).reduce((acc, d) => {
        acc[d.label] = d.value
        return acc
      }, {} as Record<string, string>)

      // Créer un tableau avec une seule ligne de données (format horizontal)
      const rows = [horizontalData]

      ExcelGenerator.generate(rows, `rapport-${reportType.id}-${period}-${Date.now()}`)
    } catch (error) {
      console.error("Erreur lors de l'export Excel:", error)
      alert("Une erreur est survenue lors de l'export Excel")
    }
  }

  return (
    <Card className="hover:shadow-lg transition-all duration-200">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-accent ${reportType.color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold leading-tight">{reportType.title}</CardTitle>
              <CardDescription className="text-sm leading-relaxed mt-1">
                {reportType.description}
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Sélection de période */}
        <div className="space-y-2">
          <Label htmlFor={`period-${reportType.id}`} className="text-sm font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Période
          </Label>
          <Select value={period} onValueChange={(value) => setPeriod(value as Period)}>
            <SelectTrigger id={`period-${reportType.id}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Cette semaine</SelectItem>
              <SelectItem value="month">Ce mois</SelectItem>
              <SelectItem value="quarter">Ce trimestre</SelectItem>
              <SelectItem value="year">Cette année</SelectItem>
              <SelectItem value="custom">Personnalisée</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Dates personnalisées */}
        {period === "custom" && (
          <div className="grid gap-3 grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor={`start-${reportType.id}`} className="text-xs">Date de début</Label>
              <Input
                id={`start-${reportType.id}`}
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-9"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`end-${reportType.id}`} className="text-xs">Date de fin</Label>
              <Input
                id={`end-${reportType.id}`}
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-9"
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-2 pt-2">
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || (period === "custom" && (!startDate || !endDate))}
            className="w-full"
          >
            <FileText className="mr-2 h-4 w-4" />
            {isGenerating ? "Génération..." : "Générer"}
          </Button>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={handleExportPDF} className="w-full" size="sm">
              <Download className="mr-2 h-4 w-4" />
              PDF
            </Button>
            <Button variant="outline" onClick={handleExportExcel} className="w-full" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Excel
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
