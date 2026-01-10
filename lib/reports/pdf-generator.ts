// Service de génération PDF (simplifié - nécessiterait react-pdf ou jspdf en production)

export class PDFGenerator {
  /**
   * Génère un PDF à partir de données
   */
  static generate(data: {
    title: string
    content: string
    tables?: Array<{ headers: string[]; rows: unknown[][] }>
    charts?: Array<{ type: string; data: unknown }>
    metadata?: Record<string, string | number>
  }): void {
    // En production, utiliser react-pdf ou jspdf
    // Pour l'instant, on génère un HTML qui peut être imprimé en PDF
    const html = this.generateHTML(data)
    const blob = new Blob([html], { type: "text/html" })
    const url = URL.createObjectURL(blob)
    const window = open(url)
    if (window) {
      window.print()
    }
    URL.revokeObjectURL(url)
  }

  private static generateHTML(data: {
    title: string
    content: string
    tables?: Array<{ headers: string[]; rows: unknown[][] }>
    metadata?: Record<string, string | number>
  }): string {
    const generatedDate = new Date().toLocaleString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })

    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${data.title}</title>
        <style>
          @page {
            margin: 2cm;
            size: A4;
          }
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            padding: 20px;
            color: #333;
            line-height: 1.6;
          }
          .header {
            border-bottom: 3px solid #ff6600;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          h1 { 
            color: #ff6600;
            margin: 0;
            font-size: 28px;
            font-weight: 700;
          }
          .subtitle {
            color: #666;
            font-size: 14px;
            margin-top: 5px;
          }
          .metadata {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
          }
          .metadata-item {
            display: flex;
            flex-direction: column;
          }
          .metadata-label {
            font-size: 12px;
            color: #666;
            font-weight: 600;
            text-transform: uppercase;
            margin-bottom: 5px;
          }
          .metadata-value {
            font-size: 16px;
            color: #333;
            font-weight: 700;
          }
          .content {
            margin: 20px 0;
            line-height: 1.8;
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 25px 0;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          th, td { 
            border: 1px solid #dee2e6; 
            padding: 12px;
            text-align: left;
          }
          th { 
            background-color: #ff6600;
            color: white;
            font-weight: 600;
            text-transform: uppercase;
            font-size: 12px;
            letter-spacing: 0.5px;
          }
          tr:nth-child(even) {
            background-color: #f8f9fa;
          }
          tr:hover {
            background-color: #e9ecef;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #dee2e6;
            text-align: center;
            color: #666;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${data.title}</h1>
          <div class="subtitle">Rapport généré le ${generatedDate}</div>
        </div>
        
        ${data.metadata ? `
          <div class="metadata">
            ${Object.entries(data.metadata).map(([key, value]) => `
              <div class="metadata-item">
                <div class="metadata-label">${key}</div>
                <div class="metadata-value">${value}</div>
              </div>
            `).join('')}
          </div>
        ` : ''}
        
        <div class="content">
          ${data.content}
        </div>
    `

    if (data.tables) {
      for (const table of data.tables) {
        html += "<table>"
        html += "<thead><tr>"
        for (const header of table.headers) {
          html += `<th>${header}</th>`
        }
        html += "</tr></thead><tbody>"
        for (const row of table.rows) {
          html += "<tr>"
          for (const cell of row) {
            html += `<td>${String(cell)}</td>`
          }
          html += "</tr>"
        }
        html += "</tbody></table>"
      }
    }

    html += `
        <div class="footer">
          <p>Ce rapport a été généré automatiquement par la plateforme ODL Learning</p>
        </div>
      </body>
      </html>
    `

    return html
  }
}

