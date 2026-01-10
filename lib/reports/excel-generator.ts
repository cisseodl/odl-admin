// Service de génération Excel (simplifié - nécessiterait xlsx en production)

export class ExcelGenerator {
  /**
   * Génère un fichier Excel à partir de données
   */
  static generate(data: unknown[], filename: string, metadata?: Record<string, string | number>): void {
    // En production, utiliser la bibliothèque xlsx
    // Pour l'instant, on génère un CSV qui peut être ouvert dans Excel
    const csv = this.convertToCSV(data, metadata)
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" }) // BOM pour UTF-8
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${filename}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  private static convertToCSV(data: unknown[], metadata?: Record<string, string | number>): string {
    const csvRows: string[] = []
    
    // Ajouter les métadonnées en en-tête si disponibles
    if (metadata && Object.keys(metadata).length > 0) {
      csvRows.push("MÉTADONNÉES DU RAPPORT")
      csvRows.push("")
      for (const [key, value] of Object.entries(metadata)) {
        csvRows.push(`"${key}","${String(value).replace(/"/g, '""')}"`)
      }
      csvRows.push("")
      csvRows.push("DONNÉES")
      csvRows.push("")
    }

    if (data.length === 0) {
      csvRows.push("Aucune donnée disponible")
      return csvRows.join("\n")
    }

    // Extraire les en-têtes
    const headers = Object.keys(data[0] as Record<string, unknown>)
    csvRows.push(headers.map(h => `"${h.replace(/"/g, '""')}"`).join(","))

    // Extraire les valeurs
    for (const row of data) {
      const values = headers.map((header) => {
        const value = (row as Record<string, unknown>)[header]
        const stringValue = value === null || value === undefined ? "" : String(value)
        return `"${stringValue.replace(/"/g, '""')}"`
      })
      csvRows.push(values.join(","))
    }

    // Ajouter un footer avec la date de génération
    csvRows.push("")
    csvRows.push(`"Rapport généré le","${new Date().toLocaleString("fr-FR")}"`)

    return csvRows.join("\n")
  }
}

