"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Download, FileText, Calendar } from "lucide-react"
import { PDFGenerator } from "@/lib/reports/pdf-generator"
import { ExcelGenerator } from "@/lib/reports/excel-generator"
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

  const Icon = reportType.icon

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
    // Simuler des données de rapport selon le type
    const baseData = {
      period: getPeriodLabel(period),
      generatedAt: new Date().toLocaleString("fr-FR"),
      startDate: period === "custom" ? startDate : "",
      endDate: period === "custom" ? endDate : "",
    }

    switch (reportType.id) {
      case "engagement":
        return {
          ...baseData,
          metrics: {
            completionRate: "68.4%",
            averageTime: "4.2h",
            averageScore: "85/100",
            interactions: "12,543",
          },
          details: [
            { label: "Taux de complétion", value: "68.4%" },
            { label: "Temps moyen", value: "4.2h" },
            { label: "Score moyen", value: "85/100" },
            { label: "Interactions totales", value: "12,543" },
          ],
        }
      case "users":
        return {
          ...baseData,
          metrics: {
            newUsers: "1,234",
            retentionRate: "82.5%",
            activeUsers: "12,543",
            growthRate: "+12.5%",
          },
          details: [
            { label: "Nouveaux utilisateurs", value: "1,234" },
            { label: "Taux de rétention", value: "82.5%" },
            { label: "Utilisateurs actifs", value: "12,543" },
            { label: "Taux de croissance", value: "+12.5%" },
          ],
        }
      case "courses":
        return {
          ...baseData,
          metrics: {
            totalCourses: "256",
            popularCourse: "JavaScript",
            averageRating: "4.7/5",
            enrollments: "8,450",
          },
          details: [
            { label: "Total formations", value: "256" },
            { label: "Formation populaire", value: "JavaScript" },
            { label: "Note moyenne", value: "4.7/5" },
            { label: "Inscriptions", value: "8,450" },
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
          <h2>${reportData.title}</h2>
          <p>${reportData.description}</p>
          <p><strong>Période:</strong> ${reportData.period}</p>
          <p><strong>Généré le:</strong> ${reportData.generatedAt}</p>
          <h3>Détails</h3>
        `,
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
      const rows = [
        {
          Type: reportType.title,
          Période: getPeriodLabel(period),
          "Date de génération": new Date().toLocaleString("fr-FR"),
          ...(data.metrics || {}),
        },
        ...(data.details || []).map((d) => ({
          Métrique: d.label,
          Valeur: d.value,
        })),
      ]

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
