"use client"

import { useState, useMemo } from "react"
import { PageHeader } from "@/components/ui/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Trophy, Medal, Award, Star, BookOpen, GraduationCap } from "lucide-react" // Added BookOpen, GraduationCap
import { MonthlyLeaderboard } from "@/components/admin/leaderboard/monthly-leaderboard"
import { CourseLeaderboard } from "@/components/admin/leaderboard/course-leaderboard"
import { PointsCalculator } from "@/lib/gamification/points-calculator"
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

// Extension du type LeaderboardEntry pour inclure les détails des formations et certifications
interface UserDetails extends LeaderboardEntry {
  completedCoursesList: { id: number, title: string }[]
  certificationsList: { id: number, title: string, issuedDate: string }[]
}

export default function LeaderboardPage() {
  const [selectedUser, setSelectedUser] = useState<UserDetails | null>(null)
  const [showUserDetailsModal, setShowUserDetailsModal] = useState(false)

  // Données simulées pour le classement général
  const overallData: Omit<LeaderboardEntry, "rank">[] = [
    { userId: 1, userName: "Marie Dupont", avatar: "/diverse-woman-portrait.png", coursesCompleted: 24, certifications: 5 },
    { userId: 2, userName: "Thomas Martin", coursesCompleted: 22, certifications: 4 },
    { userId: 3, userName: "Sophie Bernard", avatar: "/diverse-woman-portrait.png", coursesCompleted: 20, certifications: 3 },
    { userId: 4, userName: "Lucas Petit", coursesCompleted: 18, certifications: 2 },
    { userId: 5, userName: "Emma Moreau", avatar: "/diverse-woman-portrait.png", coursesCompleted: 17, certifications: 1 },
  ]

  // Données mensuelles (simulées)
  const monthlyData: LeaderboardEntry[] = [
    { rank: 1, userId: 1, userName: "Marie Dupont", avatar: "/diverse-woman-portrait.png", coursesCompleted: 6, certifications: 1, change: 0 },
    { rank: 2, userId: 2, userName: "Thomas Martin", coursesCompleted: 5, certifications: 0, change: 1 },
    { rank: 3, userId: 3, userName: "Sophie Bernard", avatar: "/diverse-woman-portrait.png", coursesCompleted: 4, certifications: 1, change: -1 },
    { rank: 4, userId: 4, userName: "Lucas Petit", coursesCompleted: 4, certifications: 0, change: 0 },
    { rank: 5, userId: 5, userName: "Emma Moreau", avatar: "/diverse-woman-portrait.png", coursesCompleted: 3, certifications: 0, change: 2 },
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
      { rank: 1, userId: 1, userName: "Marie Dupont", avatar: "/diverse-woman-portrait.png", coursesCompleted: 1, certifications: 1 },
      { rank: 2, userId: 2, userName: "Thomas Martin", coursesCompleted: 1, certifications: 1 },
      { rank: 3, userId: 3, userName: "Sophie Bernard", avatar: "/diverse-woman-portrait.png", coursesCompleted: 1, certifications: 0 },
      { rank: 4, userId: 4, userName: "Lucas Petit", coursesCompleted: 1, certifications: 0 },
      { rank: 5, userId: 5, userName: "Emma Moreau", avatar: "/diverse-woman-portrait.png", coursesCompleted: 1, certifications: 0 },
    ]
  }

  // Fonction pour obtenir les détails simulés d'un utilisateur
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


  // Calculer les rangs pour le classement général
  const overallLeaderboard = useMemo(() => {
    // PointsCalculator.sortLeaderboard n'est plus pertinent si on n'a plus de points globaux
    // On va simplement trier par coursesCompleted puis certifications pour le classement
    const sorted = [...overallData].sort((a, b) => {
      if (b.coursesCompleted !== a.coursesCompleted) {
        return b.coursesCompleted - a.coursesCompleted // Plus de cours terminés = mieux
      }
      return b.certifications - a.certifications // Puis par certifications
    })
    return sorted.map((entry, index) => ({ ...entry, rank: index + 1 }))
  }, [overallData])

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
        <TabsList className="grid w-full grid-cols-3 bg-[rgb(50,50,50)]/10 dark:bg-[rgb(50,50,50)]/20 border border-[rgb(50,50,50)]/20">
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
              <CardDescription>Top utilisateurs par nombre de formations et certifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {overallLeaderboard.map((entry) => (
                  <div
                    key={entry.rank}
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
                        <div className="font-medium">{entry.userName}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-4">
                          <span>{entry.coursesCompleted} formations</span>
                          <span>•</span>
                          <span>{entry.certifications} certifications</span>
                        </div>
                      </div>
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

      {/* Modal Détails Utilisateur */}
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
    </div>
  )
}


