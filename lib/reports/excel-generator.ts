// Service de génération Excel (simplifié - nécessiterait xlsx en production)

export class ExcelGenerator {
  /**
   * Génère un fichier Excel à partir de données
   */
  static generate(data: unknown[], filename: string): void {
    // En production, utiliser la bibliothèque xlsx
    // Pour l'instant, on génère un CSV qui peut être ouvert dans Excel
    const csv = this.convertToCSV(data)
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${filename}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  private static convertToCSV(data: unknown[]): string {
    if (data.length === 0) return ""

    // Extraire les en-têtes
    const headers = Object.keys(data[0] as Record<string, unknown>)
    const csvRows = [headers.join(",")]

    // Extraire les valeurs
    for (const row of data) {
      const values = headers.map((header) => {
        const value = (row as Record<string, unknown>)[header]
        return `"${String(value).replace(/"/g, '""')}"`
      })
      csvRows.push(values.join(","))
    }

    return csvRows.join("\n")
  }
}

