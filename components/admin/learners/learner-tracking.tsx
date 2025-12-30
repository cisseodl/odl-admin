"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  User,
  BookOpen,
  CheckCircle2,
  Clock,
  TrendingUp,
  AlertCircle,
  Calendar,
  Award,
  Target,
  BarChart3,
} from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

type Learner = {
  id: number
  name: string
  email: string
  avatar?: string
  enrolledCourses: number
  completedCourses: number
  totalProgress: number
  totalTimeSpent: number // en minutes
  lastActivity: string
  currentCourses: Array<{
    courseId: number
    courseTitle: string
    progress: number
    lastAccessed: string
    timeSpent: number
    completedModules: number
    totalModules: number
  }>
  achievements: Array<{
    id: string
    title: string
    date: string
  }>
  frictionPoints: Array<{
    courseId: number
    courseTitle: string
    moduleId: string
    moduleTitle: string
    issue: string
    severity: "low" | "medium" | "high"
  }>
}

type LearnerTrackingProps = {
  learner: Learner
}

export function LearnerTracking({ learner }: LearnerTrackingProps) {
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null)

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "text-[hsl(var(--success))]"
    if (progress >= 50) return "text-primary"
    return "text-destructive"
  }

  const selectedCourseData = learner.currentCourses.find((c) => c.courseId === selectedCourse)

  return (
    <div className="space-y-6">
      {/* En-tête avec informations générales */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={learner.avatar} alt={learner.name} />
                <AvatarFallback className="text-lg">{learner.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">{learner.name}</CardTitle>
                <CardDescription className="mt-1">{learner.email}</CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="text-sm">
              {learner.completedCourses} / {learner.enrolledCourses} formations complétées
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Target className="h-4 w-4" />
                Progression globale
              </div>
              <div className="flex items-center gap-2">
                <span className={cn("text-2xl font-bold", getProgressColor(learner.totalProgress))}>
                  {learner.totalProgress}%
                </span>
              </div>
              <Progress value={learner.totalProgress} className="h-2" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                Temps total
              </div>
              <p className="text-2xl font-bold">{formatTime(learner.totalTimeSpent)}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4" />
                Formations complétées
              </div>
              <p className="text-2xl font-bold">{learner.completedCourses}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Dernière activité
              </div>
              <p className="text-sm font-medium">{format(new Date(learner.lastActivity), "PPP")}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Onglets */}
      <Tabs defaultValue="courses" className="space-y-4">
        <TabsList>
          <TabsTrigger value="courses">Formations en cours</TabsTrigger>
          <TabsTrigger value="timeline">Timeline de progression</TabsTrigger>
          <TabsTrigger value="friction">Points de friction</TabsTrigger>
          <TabsTrigger value="achievements">Réalisations</TabsTrigger>
        </TabsList>

        {/* Formations en cours */}
        <TabsContent value="courses" className="space-y-4">
          <div className="grid gap-4">
            {learner.currentCourses.map((course) => (
              <Card key={course.courseId} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <BookOpen className="h-4 w-4 text-primary" />
                        <h4 className="font-semibold">{course.courseTitle}</h4>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Progression</span>
                          <span className={cn("font-medium", getProgressColor(course.progress))}>
                            {course.progress}%
                          </span>
                        </div>
                        <Progress value={course.progress} className="h-2" />
                        <div className="grid grid-cols-3 gap-4 text-xs text-muted-foreground">
                          <div>
                            <span className="font-medium">{course.completedModules}</span> /{" "}
                            {course.totalModules} modules
                          </div>
                          <div>
                            <Clock className="h-3 w-3 inline mr-1" />
                            {formatTime(course.timeSpent)}
                          </div>
                          <div>
                            <Calendar className="h-3 w-3 inline mr-1" />
                            {format(new Date(course.lastAccessed), "d MMM")}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Timeline de progression */}
        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Timeline de progression
              </CardTitle>
              <CardDescription>Historique détaillé de l'activité d'apprentissage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {learner.currentCourses.map((course, index) => (
                  <div key={course.courseId} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full bg-primary" />
                      {index < learner.currentCourses.length - 1 && (
                        <div className="w-0.5 h-full bg-border mt-2" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{course.courseTitle}</span>
                        <Badge variant="outline" className="text-xs">
                          {format(new Date(course.lastAccessed), "PPP")}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{course.progress}% complété</span>
                        <span>{formatTime(course.timeSpent)} passé</span>
                        <span>
                          {course.completedModules}/{course.totalModules} modules
                        </span>
                      </div>
                      <Progress value={course.progress} className="h-2 mt-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Points de friction */}
        <TabsContent value="friction" className="space-y-4">
          {learner.frictionPoints.length > 0 ? (
            <div className="space-y-4">
              {learner.frictionPoints.map((point, index) => (
                <Card
                  key={index}
                  className={cn(
                    "border-l-4",
                    point.severity === "high" && "border-l-red-500",
                    point.severity === "medium" && "border-l-orange-500",
                    point.severity === "low" && "border-l-yellow-500"
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertCircle
                            className={cn(
                              "h-4 w-4",
                              point.severity === "high" && "text-destructive",
                              point.severity === "medium" && "text-[hsl(var(--warning))]",
                              point.severity === "low" && "text-primary"
                            )}
                          />
                          <h4 className="font-medium">{point.courseTitle}</h4>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">{point.moduleTitle}</p>
                        <p className="text-sm">{point.issue}</p>
                      </div>
                      <Badge
                        variant={
                          point.severity === "high"
                            ? "destructive"
                            : point.severity === "medium"
                              ? "default"
                              : "secondary"
                        }
                      >
                        {point.severity === "high" ? "Élevé" : point.severity === "medium" ? "Moyen" : "Faible"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Aucun point de friction identifié</p>
                <p className="text-xs mt-2">L'apprenant progresse bien dans toutes ses formations</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Réalisations */}
        <TabsContent value="achievements" className="space-y-4">
          {learner.achievements.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {learner.achievements.map((achievement) => (
                <Card key={achievement.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-primary/10 rounded-full">
                        <Award className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{achievement.title}</h4>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(achievement.date), "PPP")}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Aucune réalisation pour le moment</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

