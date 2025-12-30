import type { LeaderboardEntry, UserPoints } from "@/types/gamification"

export class PointsCalculator {
  // Points par action
  private static readonly POINTS_RULES = {
    courseCompletion: 100,
    quizScore: 10, // par point de score
    dailyLogin: 5,
    badgeEarned: 50,
    streakDay: 2, // points par jour de série
  }

  /**
   * Calcule les points totaux d'un utilisateur
   */
  static calculateTotalPoints(userPoints: UserPoints): number {
    return (
      userPoints.pointsByCategory.completion +
      userPoints.pointsByCategory.quiz +
      userPoints.pointsByCategory.participation +
      userPoints.pointsByCategory.badges
    )
  }

  /**
   * Calcule les points pour une complétion de cours
   */
  static calculateCompletionPoints(score: number): number {
    return this.POINTS_RULES.courseCompletion + Math.round(score * this.POINTS_RULES.quizScore)
  }

  /**
   * Calcule les points pour un quiz
   */
  static calculateQuizPoints(score: number, maxScore: number): number {
    const percentage = (score / maxScore) * 100
    return Math.round(percentage * this.POINTS_RULES.quizScore)
  }

  /**
   * Calcule les points pour une série (streak)
   */
  static calculateStreakPoints(consecutiveDays: number): number {
    return consecutiveDays * this.POINTS_RULES.streakDay
  }

  /**
   * Calcule les points pour une connexion quotidienne
   */
  static calculateDailyLoginPoints(): number {
    return this.POINTS_RULES.dailyLogin
  }

  /**
   * Calcule les points pour un badge obtenu
   */
  static calculateBadgePoints(): number {
    return this.POINTS_RULES.badgeEarned
  }

  /**
   * Trie les entrées du leaderboard par points
   */
  static sortLeaderboard(entries: LeaderboardEntry[]): LeaderboardEntry[] {
    return [...entries].sort((a, b) => {
      // Trier par points décroissants
      if (b.points !== a.points) {
        return b.points - a.points
      }
      // En cas d'égalité, trier par nombre de badges
      if (b.badges !== a.badges) {
        return b.badges - a.badges
      }
      // En cas d'égalité, trier par nombre de cours complétés
      return b.coursesCompleted - a.coursesCompleted
    })
  }

  /**
   * Calcule le changement de position
   */
  static calculatePositionChange(
    currentRank: number,
    previousRank: number | undefined
  ): number | undefined {
    if (previousRank === undefined) return undefined
    return previousRank - currentRank // Positif = montée, négatif = descente
  }
}

