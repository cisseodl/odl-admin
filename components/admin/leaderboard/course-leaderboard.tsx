"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Trophy, Medal, Award, Star, BookOpen } from "lucide-react"
import type { LeaderboardEntry } from "@/types/gamification"

type CourseLeaderboardProps = {
  courses: { id: number; title: string }[]
  getLeaderboardForCourse: (courseId: number) => LeaderboardEntry[]
}

export function CourseLeaderboard({ courses, getLeaderboardForCourse }: CourseLeaderboardProps) {
  const [selectedCourseId, setSelectedCourseId] = useState<number>(courses[0]?.id || 0)

  const leaderboardEntries = selectedCourseId ? getLeaderboardForCourse(selectedCourseId) : []

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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-semibold leading-tight">Classement par Formation</CardTitle>
            <CardDescription className="text-sm leading-relaxed">
              Meilleurs scores et performances par formation
            </CardDescription>
          </div>
          <Select
            value={selectedCourseId.toString()}
            onValueChange={(value) => setSelectedCourseId(parseInt(value))}
          >
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Sélectionner une formation" />
            </SelectTrigger>
            <SelectContent>
              {courses.map((course) => (
                <SelectItem key={course.id} value={course.id.toString()}>
                  {course.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {leaderboardEntries.length > 0 ? (
            leaderboardEntries.map((entry) => (
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
                    <div className="font-medium">{entry.userName}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-3.5 w-3.5" />
                        {entry.coursesCompleted} formation(s)
                      </span>
                      <span>•</span>
                      <span>{entry.badges} badges</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    {entry.points.toLocaleString("fr-FR")} pts
                  </Badge>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-8">
              Aucune donnée pour cette formation
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

