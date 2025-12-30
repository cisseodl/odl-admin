"use client"

import { useState, useMemo } from "react"
import { PageHeader } from "@/components/ui/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Trophy, Medal, Award, Star } from "lucide-react"
import { MonthlyLeaderboard } from "@/components/admin/leaderboard/monthly-leaderboard"
import { CourseLeaderboard } from "@/components/admin/leaderboard/course-leaderboard"
import { PointsCalculator } from "@/lib/gamification/points-calculator"
import type { LeaderboardEntry } from "@/types/gamification"

export default function LeaderboardPage() {
  // Données simulées pour le classement général
  const overallData: Omit<LeaderboardEntry, "rank">[] = [
    { userId: 1, userName: "Marie Dupont", avatar: "/diverse-woman-portrait.png", points: 12500, badges: 15, coursesCompleted: 24 },
    { userId: 2, userName: "Thomas Martin", points: 11200, badges: 12, coursesCompleted: 22 },
    { userId: 3, userName: "Sophie Bernard", avatar: "/diverse-woman-portrait.png", points: 10800, badges: 11, coursesCompleted: 20 },
    { userId: 4, userName: "Lucas Petit", points: 9800, badges: 10, coursesCompleted: 18 },
    { userId: 5, userName: "Emma Moreau", avatar: "/diverse-woman-portrait.png", points: 9200, badges: 9, coursesCompleted: 17 },
  ]

  // Données mensuelles (simulées)
  const monthlyData: LeaderboardEntry[] = [
    { rank: 1, userId: 1, userName: "Marie Dupont", avatar: "/diverse-woman-portrait.png", points: 3200, badges: 4, coursesCompleted: 6, change: 0 },
    { rank: 2, userId: 2, userName: "Thomas Martin", points: 2800, badges: 3, coursesCompleted: 5, change: 1 },
    { rank: 3, userId: 3, userName: "Sophie Bernard", avatar: "/diverse-woman-portrait.png", points: 2500, badges: 3, coursesCompleted: 4, change: -1 },
    { rank: 4, userId: 4, userName: "Lucas Petit", points: 2200, badges: 2, coursesCompleted: 4, change: 0 },
    { rank: 5, userId: 5, userName: "Emma Moreau", avatar: "/diverse-woman-portrait.png", points: 2000, badges: 2, coursesCompleted: 3, change: 2 },
  ]

  // Données par formation (simulées)
  const courses = [
    { id: 1, title: "React Avancé" },
    { id: 2, title: "Node.js" },
    { id: 3, title: "Python" },
    { id: 4, title: "JavaScript" },
    { id: 5, title: "TypeScript" },
  ]

  const getLeaderboardForCourse = (courseId: number): LeaderboardEntry[] => {
    // Simuler des données différentes par formation
    return [
      { rank: 1, userId: 1, userName: "Marie Dupont", avatar: "/diverse-woman-portrait.png", points: 950, badges: 1, coursesCompleted: 1 },
      { rank: 2, userId: 2, userName: "Thomas Martin", points: 880, badges: 1, coursesCompleted: 1 },
      { rank: 3, userId: 3, userName: "Sophie Bernard", avatar: "/diverse-woman-portrait.png", points: 820, badges: 1, coursesCompleted: 1 },
      { rank: 4, userId: 4, userName: "Lucas Petit", points: 750, badges: 0, coursesCompleted: 1 },
      { rank: 5, userId: 5, userName: "Emma Moreau", avatar: "/diverse-woman-portrait.png", points: 680, badges: 0, coursesCompleted: 1 },
    ]
  }

  // Calculer les rangs pour le classement général
  const overallLeaderboard = useMemo(() => {
    const sorted = PointsCalculator.sortLeaderboard(
      overallData.map((entry, index) => ({ ...entry, rank: index + 1 }))
    )
    return sorted.map((entry, index) => ({ ...entry, rank: index + 1 }))
  }, [])

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />
      default:
        return <span className="text-muted-foreground font-bold">#{rank}</span>
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Classements"
        description="Consultez les classements et performances des utilisateurs"
      />

      <Tabs defaultValue="overall" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 bg-[rgb(50,50,50)]/10 dark:bg-[rgb(50,50,50)]/20 border border-[rgb(50,50,50)]/20"> {/* Added styling from Notifications */}
          <TabsTrigger
            value="overall"
            className="data-[state=active]:bg-[rgb(255,102,0)] data-[state=active]:text-white dark:data-[state=active]:bg-[rgb(255,102,0)] dark:data-[state=active]:text-white"
          >
            Général
          </TabsTrigger>
          <TabsTrigger
            value="monthly"
            className="data-[state=active]:bg-[rgb(255,102,0)] data-[state=active]:text-white dark:data-[state=active]:bg-[rgb(255,102,0)] dark:data-[state=active]:text-white"
          >
            Mensuel
          </TabsTrigger>
          <TabsTrigger
            value="courses"
            className="data-[state=active]:bg-[rgb(255,102,0)] data-[state=active]:text-white dark:data-[state=active]:bg-[rgb(255,102,0)] dark:data-[state=active]:text-white"
          >
            Par formation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overall" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Classement Général</CardTitle>
              <CardDescription>Top utilisateurs par points totaux</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {overallLeaderboard.map((entry) => (
                  <div
                    key={entry.rank}
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
                        <div className="font-medium">{entry.userName}</div>
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
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monthly" className="space-y-4">
          <MonthlyLeaderboard entries={monthlyData} />
        </TabsContent>

        <TabsContent value="courses" className="space-y-4">
          <CourseLeaderboard courses={courses} getLeaderboardForCourse={getLeaderboardForCourse} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

