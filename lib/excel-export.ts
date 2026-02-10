/**
 * Utilitaire pour exporter des données en format Excel avec plusieurs feuilles
 */

import * as XLSX from 'xlsx'

export interface ExcelSheet {
  name: string
  data: any[]
  headers?: { key: string; label: string; width?: number }[]
}

/**
 * Crée un fichier Excel avec plusieurs feuilles et structure claire
 * @param sheets Tableau de feuilles Excel
 * @param filename Nom du fichier (sans extension)
 */
export function exportToExcel(sheets: ExcelSheet[], filename: string): void {
  // Créer un nouveau classeur
  const workbook = XLSX.utils.book_new()

  // Pour chaque feuille
  sheets.forEach((sheet) => {
    // Créer un tableau de tableaux pour une meilleure structure
    const worksheetArray: any[][] = []

    // Si des en-têtes personnalisés sont fournis, les utiliser
    if (sheet.headers && sheet.headers.length > 0) {
      // Ligne d'en-tête avec les labels
      const headerRow = sheet.headers.map(header => header.label)
      worksheetArray.push(headerRow)

      // Ligne de séparation (vide pour la lisibilité)
      worksheetArray.push([])

      // Ajouter les données
      sheet.data.forEach((row) => {
        const dataRow = sheet.headers.map((header) => {
          return row[header.key] !== undefined ? row[header.key] : ''
        })
        worksheetArray.push(dataRow)
      })
    } else {
      // Utiliser les données telles quelles
      if (sheet.data.length > 0) {
        // En-têtes depuis les clés du premier objet
        const firstRow = sheet.data[0]
        const headerRow = Object.keys(firstRow)
        worksheetArray.push(headerRow)
        worksheetArray.push([]) // Ligne de séparation

        // Données
        sheet.data.forEach((row) => {
          const dataRow = Object.keys(firstRow).map(key => row[key] !== undefined ? row[key] : '')
          worksheetArray.push(dataRow)
        })
      }
    }

    // Créer la feuille de calcul à partir du tableau
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetArray)

    // Définir les largeurs de colonnes
    const colWidths: { wch: number }[] = []
    if (sheet.headers && sheet.headers.length > 0) {
      sheet.headers.forEach((header) => {
        colWidths.push({ wch: header.width || 20 })
      })
    } else if (worksheetArray.length > 0 && worksheetArray[0].length > 0) {
      worksheetArray[0].forEach(() => {
        colWidths.push({ wch: 20 })
      })
    }
    worksheet['!cols'] = colWidths

    // Définir la hauteur de la ligne d'en-tête et des lignes de données
    if (worksheetArray.length > 0) {
      const rows: { hpt: number }[] = []
      rows.push({ hpt: 30 }) // Hauteur pour l'en-tête
      // Hauteur pour la ligne de séparation (vide)
      if (worksheetArray.length > 1 && worksheetArray[1].length === 0) {
        rows.push({ hpt: 5 })
      }
      // Hauteur standard pour les lignes de données
      for (let i = 2; i < worksheetArray.length; i++) {
        rows.push({ hpt: 20 })
      }
      worksheet['!rows'] = rows
    }

    // Ajouter la feuille au classeur
    XLSX.utils.book_append_sheet(workbook, worksheet, sheet.name)
  })

  // Générer le fichier Excel
  XLSX.writeFile(workbook, `${filename}.xlsx`)
}

/**
 * Convertit un tableau d'objets en format Excel avec en-têtes personnalisés
 */
export function convertToExcelFormat<T extends Record<string, any>>(
  data: T[],
  headers?: { key: keyof T; label: string; width?: number }[]
): ExcelSheet {
  if (!data || data.length === 0) {
    return {
      name: 'Sheet1',
      data: [],
      headers: headers?.map((h) => ({ key: String(h.key), label: h.label, width: h.width }))
    }
  }

  // Si des en-têtes personnalisés sont fournis, les utiliser
  if (headers && headers.length > 0) {
    const formattedData = data.map((row) => {
      const formattedRow: any = {}
      headers.forEach((header) => {
        formattedRow[String(header.key)] = formatValueForExcel(row[header.key])
      })
      return formattedRow
    })

    return {
      name: 'Sheet1',
      data: formattedData,
      headers: headers.map((h) => ({ key: String(h.key), label: h.label, width: h.width || 20 }))
    }
  }

  // Sinon, utiliser les clés du premier objet
  return {
    name: 'Sheet1',
    data: data.map((row) => {
      const formattedRow: any = {}
      Object.keys(row).forEach((key) => {
        formattedRow[key] = formatValueForExcel(row[key])
      })
      return formattedRow
    })
  }
}

/**
 * Formate une valeur pour l'export Excel
 */
function formatValueForExcel(value: any): string | number {
  if (value === null || value === undefined) {
    return ''
  }

  if (typeof value === 'boolean') {
    return value ? 'Oui' : 'Non'
  }

  if (typeof value === 'number') {
    return value
  }

  if (value instanceof Date) {
    return value.toLocaleDateString('fr-FR')
  }

  if (typeof value === 'object') {
    return JSON.stringify(value)
  }

  return String(value)
}
