"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Trophy, Medal, Award, TrendingUp, TrendingDown, BookOpen, GraduationCap } from "lucide-react" // Added BookOpen, GraduationCap
import type { LeaderboardEntry } from "@/types/gamification"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"

type MonthlyLeaderboardProps = {
  entries: LeaderboardEntry[]
}

// Extension du type LeaderboardEntry pour inclure les détails des formations et certifications
interface UserDetails extends LeaderboardEntry {
  completedCoursesList: { id: number, title: string }[]
  certificationsList: { id: number, title: string, issuedDate: string }[]
}

export function MonthlyLeaderboard({ entries }: MonthlyLeaderboardProps) {
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().slice(0, 7) // Format YYYY-MM
  )
  const [selectedUser, setSelectedUser] = useState<UserDetails | null>(null)
  const [showUserDetailsModal, setShowUserDetailsModal] = useState(false)

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

  // Fonction pour obtenir les détails simulés d'un utilisateur (copiée de leaderboard/page.tsx)
  const getUserDetails = (entry: LeaderboardEntry): UserDetails => {
    // Ceci simulerait un appel API ou une recherche dans une base de données
    const simulatedUserDetails: UserDetails = {
      ...entry,
      completedCoursesList: [
        { id: 101, title: "Introduction au Dev Web" },
        { id: 102, title: "Bases de Python" },
        { id: 103, title: "UX/UI Design" },
      ].filter((_, idx) => idx < entry.coursesCompleted), // Simule les cours terminés
      certificationsList: [
        { id: 201, title: "Certificat React", issuedDate: "2023-03-15" },
        { id: 202, title: "Certificat Python", issuedDate: "2023-06-20" },
      ].filter((_, idx) => idx < entry.certifications), // Simule les certifications
    }
    return simulatedUserDetails
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
                className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent transition-colors cursor-pointer" // Added cursor-pointer
                onClick={() => { // Added onClick to open modal
                  setSelectedUser(getUserDetails(entry))
                  setShowUserDetailsModal(true)
                }}
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
                      <span>{entry.coursesCompleted} formations</span>
                      <span>•</span>
                      <span>{entry.certifications} certifications</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Award className="h-3 w-3" /> {/* Utilisation de Award pour certifications */}
                    {entry.certifications}
                  </Badge>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-8">Aucune donnée pour ce mois</p>
          )}
        </div>
      </CardContent>

      {/* Modal Détails Utilisateur (copié de leaderboard/page.tsx) */}
      <Dialog open={showUserDetailsModal} onOpenChange={setShowUserDetailsModal}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Détails de {selectedUser?.userName}</DialogTitle>
            <DialogDescription>
              Aperçu des formations terminées et des certifications obtenues.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6 py-4">
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" /> Formations Terminées ({selectedUser.completedCoursesList.length})
                </h3>
                {selectedUser.completedCoursesList.length > 0 ? (
                  <ul className="list-disc pl-5 space-y-1">
                    {selectedUser.completedCoursesList.map((course) => (
                      <li key={course.id} className="text-muted-foreground text-sm">{course.title}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground text-sm">Aucune formation terminée.</p>
                )}
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-primary" /> Certifications Obtenues ({selectedUser.certificationsList.length})
                </h3>
                {selectedUser.certificationsList.length > 0 ? (
                  <ul className="list-disc pl-5 space-y-1">
                    {selectedUser.certificationsList.map((cert) => (
                      <li key={cert.id} className="text-muted-foreground text-sm">
                        {cert.title} (Délivré le: {cert.issuedDate})
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground text-sm">Aucune certification obtenue.</p>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUserDetailsModal(false)}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

