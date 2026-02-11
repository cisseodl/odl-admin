// Service de génération Excel avec xlsx

import * as XLSX from 'xlsx'

export class ExcelGenerator {
  /**
   * Génère un fichier Excel à partir de données
   * Format horizontal : en-têtes en ligne 1, données en lignes suivantes
   */
  static generate(data: unknown[], filename: string, metadata?: Record<string, string | number>): void {
    // Créer un nouveau classeur
    const workbook = XLSX.utils.book_new()
    const worksheetArray: any[][] = []

    if (data.length === 0) {
      worksheetArray.push(["Aucune donnée disponible"])
    } else {
      // Extraire tous les en-têtes uniques de toutes les lignes
      const allHeaders = new Set<string>()
      data.forEach((row) => {
        Object.keys(row as Record<string, unknown>).forEach(key => allHeaders.add(key))
      })
      const headers = Array.from(allHeaders)

      // Ligne 1 : En-têtes (format horizontal)
      worksheetArray.push(headers.map(h => h))

      // Lignes suivantes : Données (une ligne par enregistrement)
      for (const row of data) {
        const values = headers.map((header) => {
          const value = (row as Record<string, unknown>)[header]
          if (value === null || value === undefined) {
            return ""
          }
          if (typeof value === 'boolean') {
            return value ? 'Oui' : 'Non'
          }
          if (value instanceof Date) {
            return value.toLocaleDateString('fr-FR')
          }
          return String(value)
        })
        worksheetArray.push(values)
      }
    }

    // Créer la feuille de calcul
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetArray)

    // Définir les largeurs de colonnes
    if (worksheetArray.length > 0) {
      const colWidths: { wch: number }[] = []
      const numCols = worksheetArray[0].length
      for (let i = 0; i < numCols; i++) {
        // Calculer la largeur maximale pour chaque colonne
        let maxWidth = 15 // Largeur minimale
        worksheetArray.forEach((row) => {
          if (row[i]) {
            const cellValue = String(row[i])
            maxWidth = Math.max(maxWidth, Math.min(cellValue.length + 2, 50)) // Max 50 caractères
          }
        })
        colWidths.push({ wch: maxWidth })
      }
      worksheet['!cols'] = colWidths
    }

    // Définir la hauteur de la ligne d'en-tête
    if (worksheetArray.length > 0) {
      const rows: { hpt: number }[] = []
      rows.push({ hpt: 30 }) // Hauteur pour l'en-tête
      for (let i = 1; i < worksheetArray.length; i++) {
        rows.push({ hpt: 20 }) // Hauteur standard pour les lignes de données
      }
      worksheet['!rows'] = rows
    }

    // Ajouter la feuille au classeur
    XLSX.utils.book_append_sheet(workbook, worksheet, "Rapport")

    // Générer le fichier Excel
    XLSX.writeFile(workbook, `${filename}.xlsx`)
  }
}

