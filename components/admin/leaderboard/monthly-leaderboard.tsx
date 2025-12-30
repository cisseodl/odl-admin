"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Trophy, Medal, Award, Star, TrendingUp, TrendingDown } from "lucide-react"
import type { LeaderboardEntry } from "@/types/gamification"

type MonthlyLeaderboardProps = {
  entries: LeaderboardEntry[]
}

export function MonthlyLeaderboard({ entries }: MonthlyLeaderboardProps) {
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().slice(0, 7) // Format YYYY-MM
  )

  // Générer les 12 derniers mois
  const months = Array.from({ length: 12 }, (_, i) => {
    const date = new Date()
    date.setMonth(date.getMonth() - i)
    return {
      value: date.toISOString().slice(0, 7),
      label: date.toLocaleDateString("fr-FR", { month: "long", year: "numeric" }),
    }
  })

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-primary" />
      case 2:
        return <Medal className="h-5 w-5 text-muted-foreground" />
      case 3:
        return <Award className="h-5 w-5 text-[hsl(var(--warning))]" />
      default:
        return <span className="text-muted-foreground font-bold">#{rank}</span>
    }
  }

  const getChangeIcon = (change?: number) => {
    if (change === undefined) return null
    if (change > 0) {
      return <TrendingUp className="h-4 w-4 text-[hsl(var(--success))]" />
    } else if (change < 0) {
      return <TrendingDown className="h-4 w-4 text-destructive" />
    }
    return null
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-semibold leading-tight">Classement Mensuel</CardTitle>
            <CardDescription className="text-sm leading-relaxed">Top utilisateurs du mois sélectionné</CardDescription>
          </div>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem key={month.value} value={month.value}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {entries.length > 0 ? (
            entries.map((entry) => (
              <div
                key={entry.userId}
                className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex h-10 w-10 items-center justify-center">
                    {getRankIcon(entry.rank)}
                  </div>
                  <Avatar>
                    <AvatarImage src={entry.avatar} />
                    <AvatarFallback>{entry.userName.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-medium flex items-center gap-2">
                      {entry.userName}
                      {entry.change !== undefined && entry.change !== 0 && (
                        <div className="flex items-center gap-1">
                          {getChangeIcon(entry.change)}
                          <span
                            className={`text-xs ${
                              entry.change > 0
                                ? "text-[hsl(var(--success))]"
                                : entry.change < 0
                                  ? "text-destructive"
                                  : ""
                            }`}
                          >
                            {entry.change > 0 ? `+${entry.change}` : entry.change}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-4">
                      <span>{entry.points.toLocaleString("fr-FR")} points</span>
                      <span>•</span>
                      <span>{entry.badges} badges</span>
                      <span>•</span>
                      <span>{entry.coursesCompleted} formations</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    {entry.points.toLocaleString("fr-FR")}
                  </Badge>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-8">Aucune donnée pour ce mois</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

