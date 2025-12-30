import type { Badge, BadgeCriteria, BadgeAward } from "@/types/gamification"

interface UserProgress {
  userId: number
  completedCourses: number
  averageScore: number
  consecutiveDays: number
  totalTimeSpent: number // en heures
  lastActivityDate: string
}

export class BadgeEngine {
  /**
   * Vérifie si un utilisateur mérite un badge
   */
  static checkBadgeEligibility(badge: Badge, userProgress: UserProgress): boolean {
    const { criteria } = badge

    switch (criteria.type) {
      case "completion":
        return (
          userProgress.completedCourses >= (criteria.minCourses || criteria.threshold || 0)
        )

      case "score":
        return (
          userProgress.averageScore >= (criteria.minScore || criteria.threshold || 0)
        )

      case "participation":
        return (
          userProgress.consecutiveDays >= (criteria.consecutiveDays || criteria.threshold || 0)
        )

      case "time":
        return (
          userProgress.totalTimeSpent >= (criteria.timeSpent || criteria.threshold || 0)
        )

      case "streak":
        return (
          userProgress.consecutiveDays >= (criteria.consecutiveDays || criteria.threshold || 0)
        )

      default:
        return false
    }
  }

  /**
   * Calcule la progression vers un badge
   */
  static calculateProgress(badge: Badge, userProgress: UserProgress): number {
    const { criteria } = badge
    let current = 0
    let target = 0

    switch (criteria.type) {
      case "completion":
        current = userProgress.completedCourses
        target = criteria.minCourses || criteria.threshold || 1
        break

      case "score":
        current = userProgress.averageScore
        target = criteria.minScore || criteria.threshold || 100
        break

      case "participation":
      case "streak":
        current = userProgress.consecutiveDays
        target = criteria.consecutiveDays || criteria.threshold || 1
        break

      case "time":
        current = userProgress.totalTimeSpent
        target = criteria.timeSpent || criteria.threshold || 1
        break

      default:
        return 0
    }

    if (target === 0) return 0
    return Math.min(100, Math.round((current / target) * 100))
  }

  /**
   * Trouve tous les badges éligibles pour un utilisateur
   */
  static findEligibleBadges(
    badges: Badge[],
    userProgress: UserProgress,
    existingAwards: BadgeAward[]
  ): Badge[] {
    const awardedBadgeIds = new Set(existingAwards.map((a) => a.badgeId))

    return badges.filter(
      (badge) =>
        badge.enabled &&
        !awardedBadgeIds.has(badge.id) &&
        this.checkBadgeEligibility(badge, userProgress)
    )
  }

  /**
   * Attribue automatiquement les badges éligibles
   */
  static autoAwardBadges(
    badges: Badge[],
    userProgress: UserProgress,
    existingAwards: BadgeAward[]
  ): BadgeAward[] {
    const eligibleBadges = this.findEligibleBadges(badges, userProgress, existingAwards)

    return eligibleBadges.map((badge) => ({
      id: Date.now() + Math.random(), // ID temporaire
      badgeId: badge.id,
      userId: userProgress.userId,
      awardedAt: new Date().toISOString(),
      progress: 100,
    }))
  }
}

