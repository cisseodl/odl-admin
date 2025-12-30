"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatCard } from "@/components/shared/stat-card"
import { Award, Users, TrendingUp, Target } from "lucide-react"
import type { Badge, BadgeAward } from "@/types/gamification"

type BadgeStatsProps = {
  badges: Badge[]
  awards: BadgeAward[]
  totalUsers: number
}

export function BadgeStats({ badges, awards, totalUsers }: BadgeStatsProps) {
  const totalBadges = badges.length
  const activeBadges = badges.filter((b) => b.enabled).length
  const totalAwards = awards.length
  const uniqueUsersWithBadges = new Set(awards.map((a) => a.userId)).size
  const awardRate = totalUsers > 0 ? ((uniqueUsersWithBadges / totalUsers) * 100).toFixed(1) : "0"

  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total de badges"
        value={totalBadges.toString()}
        icon={Award}
        color="text-primary"
      />
      <StatCard
        title="Badges actifs"
        value={activeBadges.toString()}
        icon={Target}
        color="text-[hsl(var(--success))]"
      />
      <StatCard
        title="Badges attribués"
        value={totalAwards.toLocaleString("fr-FR")}
        icon={Users}
        color="text-[hsl(var(--info))]"
      />
      <StatCard
        title="Taux d'attribution"
        value={`${awardRate}%`}
        change={`${uniqueUsersWithBadges} utilisateurs`}
        icon={TrendingUp}
        color="text-[hsl(var(--warning))]"
      />
    </div>
  )
}

