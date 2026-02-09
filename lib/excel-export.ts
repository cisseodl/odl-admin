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
 * Crée un fichier Excel avec plusieurs feuilles
 * @param sheets Tableau de feuilles Excel
 * @param filename Nom du fichier (sans extension)
 */
export function exportToExcel(sheets: ExcelSheet[], filename: string): void {
  // Créer un nouveau classeur
  const workbook = XLSX.utils.book_new()

  // Pour chaque feuille
  sheets.forEach((sheet) => {
    let worksheetData: any[] = []

    // Si des en-têtes personnalisés sont fournis, les utiliser
    if (sheet.headers && sheet.headers.length > 0) {
      // Créer la ligne d'en-tête
      const headerRow: any = {}
      sheet.headers.forEach((header) => {
        headerRow[header.key] = header.label
      })
      worksheetData.push(headerRow)

      // Ajouter les données avec les clés correspondantes
      sheet.data.forEach((row) => {
        const dataRow: any = {}
        sheet.headers.forEach((header) => {
          dataRow[header.key] = row[header.key] !== undefined ? row[header.key] : ''
        })
        worksheetData.push(dataRow)
      })
    } else {
      // Utiliser les données telles quelles
      worksheetData = sheet.data
    }

    // Créer la feuille de calcul
    const worksheet = XLSX.utils.json_to_sheet(worksheetData, { skipHeader: false })

    // Définir les largeurs de colonnes
    const colWidths: { wch: number }[] = []
    if (sheet.headers && sheet.headers.length > 0) {
      sheet.headers.forEach((header) => {
        colWidths.push({ wch: header.width || 20 })
      })
    } else if (worksheetData.length > 0) {
      // Calculer automatiquement les largeurs basées sur le contenu
      const firstRow = worksheetData[0]
      Object.keys(firstRow).forEach(() => {
        colWidths.push({ wch: 20 })
      })
    }
    worksheet['!cols'] = colWidths

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
