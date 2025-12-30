import { InstructorDashboardStats } from "@/components/instructor/dashboard-stats"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, BookOpen, Users, TrendingUp } from "lucide-react"
import Link from "next/link"

export default function InstructorDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-balance">Tableau de bord Formateur</h1>
        <p className="text-muted-foreground mt-2">Vue d'ensemble de vos formations et apprenants</p>
      </div>

      <InstructorDashboardStats />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Formations Récentes</CardTitle>
                <CardDescription>Vos dernières formations créées</CardDescription>
              </div>
              <Button asChild size="sm">
                <Link href="/instructor/courses">
                  <Plus className="mr-2 h-4 w-4" />
                  Nouvelle formation
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "React Avancé", students: 450, status: "Publié" },
                { name: "Node.js Complet", students: 380, status: "Publié" },
                { name: "TypeScript Fondamentaux", students: 340, status: "En révision" },
              ].map((course, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent cursor-pointer">
                  <div className="flex items-center gap-3">
                    <BookOpen className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{course.name}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        {course.students} apprenants
                      </p>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">{course.status}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Activité Récente</CardTitle>
            <CardDescription>Les dernières actions de vos apprenants</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { user: "Marie Dupont", action: "a complété", course: "React Avancé", time: "Il y a 5 min" },
                { user: "Thomas Martin", action: "a obtenu un certificat", course: "Node.js", time: "Il y a 1h" },
                { user: "Sophie Bernard", action: "a commencé", course: "TypeScript", time: "Il y a 2h" },
              ].map((activity, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent">
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-medium">{activity.user}</span>{" "}
                      <span className="text-muted-foreground">{activity.action}</span>{" "}
                      <span className="font-medium">{activity.course}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Performance des Formations</CardTitle>
          <CardDescription>Statistiques de vos formations les plus populaires</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { name: "React Avancé", completion: 85, students: 450, rating: 4.8 },
              { name: "Node.js Complet", completion: 78, students: 380, rating: 4.6 },
              { name: "TypeScript Fondamentaux", completion: 72, students: 340, rating: 4.7 },
            ].map((course, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{course.name}</span>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {course.students}
                    </span>
                    <span className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4" />
                      {course.completion}%
                    </span>
                    <span>⭐ {course.rating}</span>
                  </div>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${course.completion}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

