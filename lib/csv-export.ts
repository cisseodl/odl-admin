/**
 * Utilitaire pour exporter des données en format CSV
 */

/**
 * Convertit un tableau d'objets en CSV
 * @param data Tableau d'objets à convertir
 * @param headers En-têtes personnalisés (optionnel)
 * @returns Chaîne CSV
 */
export function convertToCSV<T extends Record<string, any>>(
  data: T[],
  headers?: { key: keyof T; label: string }[]
): string {
  if (!data || data.length === 0) {
    return ''
  }

  // Si des en-têtes personnalisés sont fournis, les utiliser
  // Sinon, extraire les clés du premier objet
  const keys = headers
    ? headers.map((h) => h.key)
    : (Object.keys(data[0]) as Array<keyof T>)

  const headerLabels = headers
    ? headers.map((h) => h.label)
    : keys.map((k) => String(k))

  // Créer la ligne d'en-tête
  const headerRow = headerLabels
    .map((label) => escapeCSVValue(String(label)))
    .join(',')

  // Créer les lignes de données
  const dataRows = data.map((row) =>
    keys
      .map((key) => {
        const value = row[key]
        return escapeCSVValue(formatValue(value))
      })
      .join(',')
  )

  return [headerRow, ...dataRows].join('\n')
}

/**
 * Échappe les valeurs CSV (gère les virgules, guillemets, retours à la ligne)
 */
function escapeCSVValue(value: string): string {
  if (value === null || value === undefined) {
    return ''
  }

  const stringValue = String(value)

  // Si la valeur contient une virgule, un guillemet ou un retour à la ligne, l'entourer de guillemets
  if (
    stringValue.includes(',') ||
    stringValue.includes('"') ||
    stringValue.includes('\n') ||
    stringValue.includes('\r')
  ) {
    // Échapper les guillemets en les doublant
    return `"${stringValue.replace(/"/g, '""')}"`
  }

  return stringValue
}

/**
 * Formate une valeur pour l'export CSV
 */
function formatValue(value: any): string {
  if (value === null || value === undefined) {
    return ''
  }

  if (typeof value === 'boolean') {
    return value ? 'Oui' : 'Non'
  }

  if (typeof value === 'number') {
    return String(value)
  }

  if (value instanceof Date) {
    return value.toISOString()
  }

  if (typeof value === 'object') {
    return JSON.stringify(value)
  }

  return String(value)
}

/**
 * Télécharge un fichier CSV
 * @param csvContent Contenu CSV
 * @param filename Nom du fichier (sans extension)
 */
export function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' }) // BOM UTF-8 pour Excel
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Exporte des statistiques en CSV avec plusieurs sections
 */
export function exportStatisticsToCSV(sections: Array<{ title: string; data: any[]; headers?: any[] }>): string {
  const csvSections = sections.map((section) => {
    const sectionHeader = `\n=== ${section.title} ===\n`
    const csvContent = convertToCSV(section.data, section.headers)
    return sectionHeader + csvContent
  })

  return csvSections.join('\n\n')
}
