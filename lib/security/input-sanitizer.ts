/**
 * Service de sanitization des inputs
 */
export class InputSanitizer {
  /**
   * Nettoie une chaîne de caractères
   */
  static sanitizeString(input: string): string {
    return input
      .trim()
      .replace(/[<>]/g, "") // Supprimer les balises HTML
      .replace(/javascript:/gi, "") // Supprimer les protocoles javascript
      .replace(/on\w+=/gi, "") // Supprimer les event handlers
  }

  /**
   * Nettoie un objet récursivement
   */
  static sanitizeObject<T>(obj: T): T {
    if (typeof obj === "string") {
      return this.sanitizeString(obj) as T
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.sanitizeObject(item)) as T
    }

    if (obj && typeof obj === "object") {
      const sanitized = {} as T
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          ;(sanitized as Record<string, unknown>)[key] = this.sanitizeObject(
            (obj as Record<string, unknown>)[key]
          )
        }
      }
      return sanitized
    }

    return obj
  }

  /**
   * Valide un email
   */
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  /**
   * Valide une URL
   */
  static validateURL(url: string): boolean {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }
}

