"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Download, FileText } from "lucide-react"

type ReportType = "engagement" | "users" | "courses"
type Period = "week" | "month" | "quarter" | "year" | "custom"

export function ReportGenerator() {
  const [reportType, setReportType] = useState<ReportType>("engagement")
  const [period, setPeriod] = useState<Period>("month")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  const handleGenerate = () => {
    console.log("Generate report", { reportType, period, startDate, endDate })
    // Logique de génération de rapport
  }

  const handleExportPDF = () => {
    const { PDFGenerator } = require("@/lib/reports/pdf-generator")
    PDFGenerator.generate({
      title: `Rapport ${reportType}`,
      content: `Rapport généré le ${new Date().toLocaleDateString("fr-FR")}`,
      tables: [
        {
          headers: ["Métrique", "Valeur"],
          rows: [
            ["Type", reportType],
            ["Période", period],
          ],
        },
      ],
    })
  }

  const handleExportExcel = () => {
    const { ExcelGenerator } = require("@/lib/reports/excel-generator")
    ExcelGenerator.generate(
      [
        { Type: reportType, Période: period, Date: new Date().toLocaleDateString("fr-FR") },
      ],
      `rapport-${reportType}-${period}`
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Générer un Rapport</CardTitle>
        <CardDescription>Sélectionnez le type de rapport et la période</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="reportType">Type de rapport</Label>
            <Select value={reportType} onValueChange={(value) => setReportType(value as ReportType)}>
              <SelectTrigger id="reportType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="engagement">Rapport d'Engagement</SelectItem>
                <SelectItem value="users">Rapport Utilisateurs</SelectItem>
                <SelectItem value="courses">Rapport Formations</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="period">Période</Label>
            <Select value={period} onValueChange={(value) => setPeriod(value as Period)}>
              <SelectTrigger id="period">
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
        </div>

        {period === "custom" && (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="startDate">Date de début</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">Date de fin</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button onClick={handleGenerate}>
            <FileText className="mr-2 h-4 w-4" />
            Générer le rapport
          </Button>
          <Button variant="outline" onClick={handleExportPDF}>
            <Download className="mr-2 h-4 w-4" />
            Exporter en PDF
          </Button>
          <Button variant="outline" onClick={handleExportExcel}>
            <Download className="mr-2 h-4 w-4" />
            Exporter en Excel
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

