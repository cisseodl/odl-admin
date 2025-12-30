import type { AuditLog, AuditAction, AuditResource } from "@/types/audit"

export class AuditLogger {
  private static readonly STORAGE_KEY = "audit_logs"
  private static readonly MAX_LOGS = 10000

  /**
   * Enregistre une action dans le journal d'audit
   */
  static log(
    userId: number,
    userName: string,
    action: AuditAction,
    resource: AuditResource,
    options?: {
      resourceId?: number
      resourceName?: string
      details?: Record<string, unknown>
      ipAddress?: string
      userAgent?: string
      changes?: { field: string; oldValue: unknown; newValue: unknown }[]
    }
  ): void {
    if (typeof window === "undefined") return

    const logs = this.getAllLogs()
    const newLog: AuditLog = {
      id: Date.now() + Math.random(),
      userId,
      userName,
      action,
      resource,
      resourceId: options?.resourceId,
      resourceName: options?.resourceName,
      details: options?.details,
      ipAddress: options?.ipAddress || this.getClientIP(),
      userAgent: options?.userAgent || (typeof navigator !== "undefined" ? navigator.userAgent : undefined),
      timestamp: new Date().toISOString(),
      changes: options?.changes,
    }

    logs.unshift(newLog)

    // Limiter le nombre de logs
    if (logs.length > this.MAX_LOGS) {
      logs.splice(this.MAX_LOGS)
    }

    this.saveLogs(logs)
  }

  /**
   * Récupère tous les logs
   */
  static getAllLogs(): AuditLog[] {
    if (typeof window === "undefined") return []

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (!stored) return []
      return JSON.parse(stored) as AuditLog[]
    } catch {
      return []
    }
  }

  /**
   * Récupère les logs filtrés
   */
  static getFilteredLogs(filter: {
    userId?: number
    action?: AuditAction
    resource?: AuditResource
    startDate?: string
    endDate?: string
    search?: string
  }): AuditLog[] {
    let logs = this.getAllLogs()

    if (filter.userId) {
      logs = logs.filter((log) => log.userId === filter.userId)
    }

    if (filter.action) {
      logs = logs.filter((log) => log.action === filter.action)
    }

    if (filter.resource) {
      logs = logs.filter((log) => log.resource === filter.resource)
    }

    if (filter.startDate) {
      logs = logs.filter((log) => log.timestamp >= filter.startDate!)
    }

    if (filter.endDate) {
      logs = logs.filter((log) => log.timestamp <= filter.endDate!)
    }

    if (filter.search) {
      const searchLower = filter.search.toLowerCase()
      logs = logs.filter(
        (log) =>
          log.userName.toLowerCase().includes(searchLower) ||
          log.resourceName?.toLowerCase().includes(searchLower) ||
          log.action.toLowerCase().includes(searchLower) ||
          log.resource.toLowerCase().includes(searchLower)
      )
    }

    return logs
  }

  /**
   * Exporte les logs en CSV
   */
  static exportToCSV(logs: AuditLog[]): string {
    const headers = ["ID", "Utilisateur", "Action", "Ressource", "Nom", "Date", "IP"]
    const rows = logs.map((log) => [
      log.id.toString(),
      log.userName,
      log.action,
      log.resource,
      log.resourceName || "",
      new Date(log.timestamp).toLocaleString("fr-FR"),
      log.ipAddress || "",
    ])

    const csvContent = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n")

    return csvContent
  }

  /**
   * Exporte les logs en JSON
   */
  static exportToJSON(logs: AuditLog[]): string {
    return JSON.stringify(logs, null, 2)
  }

  /**
   * Obtient l'IP du client (simulé, en production utiliser une API)
   */
  private static getClientIP(): string {
    // En production, récupérer depuis l'API ou les headers
    return "127.0.0.1"
  }

  /**
   * Sauvegarde les logs
   */
  private static saveLogs(logs: AuditLog[]): void {
    if (typeof window === "undefined") return

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(logs))
    } catch (error) {
      console.error("Error saving audit logs:", error)
    }
  }
}

