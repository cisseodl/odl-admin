import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Users, TrendingUp, Award } from "lucide-react"

export function InstructorDashboardStats() {
  const stats = [
    {
      title: "Mes Formations",
      value: "12",
      change: "+2 ce mois",
      icon: BookOpen,
      color: "text-[hsl(var(--info))]",
    },
    {
      title: "Apprenants Actifs",
      value: "1,245",
      change: "+156 ce mois",
      icon: Users,
      color: "text-[hsl(var(--success))]",
    },
    {
      title: "Taux de Complétion",
      value: "78.5%",
      change: "+5.2%",
      icon: TrendingUp,
      color: "text-[hsl(var(--info))]",
    },
    {
      title: "Certificats Délivrés",
      value: "892",
      change: "+45 ce mois",
      icon: Award,
      color: "text-[hsl(var(--success))]",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
            <stat.icon className={`h-5 w-5 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-[hsl(var(--success))]">{stat.change}</span>
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

