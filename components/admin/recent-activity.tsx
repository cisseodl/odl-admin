import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { UserPlus, CheckCircle2, Star, Award, Clock } from "lucide-react"

export function RecentActivity() {
  const activities = [
    {
      id: 1,
      user: "Marie Dupont",
      avatar: "/diverse-woman-portrait.png",
      action: "s'est inscrite à",
      course: "Formation React Avancé",
      time: "Il y a 5 minutes",
      type: "inscription",
      icon: UserPlus,
      iconColor: "text-[hsl(var(--info))]",
    },
    {
      id: 2,
      user: "Thomas Martin",
      avatar: "/man.jpg",
      action: "a complété",
      course: "Formation JavaScript ES6",
      time: "Il y a 1 heure",
      type: "completion",
      icon: CheckCircle2,
      iconColor: "text-[hsl(var(--success))]",
    },
    {
      id: 3,
      user: "Sophie Bernard",
      avatar: "/diverse-woman-portrait.png",
      action: "a laissé un avis sur",
      course: "Formation Node.js",
      time: "Il y a 2 heures",
      type: "review",
      icon: Star,
      iconColor: "text-[hsl(var(--warning))]",
    },
    {
      id: 4,
      user: "Lucas Petit",
      avatar: "/diverse-group-friends.png",
      action: "a obtenu un certificat pour",
      course: "Formation Python",
      time: "Il y a 3 heures",
      type: "certificate",
      icon: Award,
      iconColor: "text-[hsl(var(--success))]",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activité Récente</CardTitle>
        <CardDescription>Les dernières actions sur la plateforme</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => {
            const IconComponent = activity.icon
            return (
              <div key={activity.id} className="flex items-center gap-4">
                <div className="relative">
                  <Avatar>
                    <AvatarImage src={activity.avatar || "/placeholder.svg"} alt={activity.user} />
                    <AvatarFallback>{activity.user.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div className={`absolute -bottom-1 -right-1 rounded-full bg-background p-0.5`}>
                    <IconComponent className={`h-3.5 w-3.5 ${activity.iconColor}`} />
                  </div>
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm leading-relaxed">
                    <span className="font-medium">{activity.user}</span>{" "}
                    <span className="text-muted-foreground">{activity.action}</span>{" "}
                    <span className="font-medium">{activity.course}</span>
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 leading-relaxed">
                    <Clock className="h-3 w-3" />
                    {activity.time}
                  </p>
                </div>
                <Badge
                  variant={
                    activity.type === "completion" ? "default" : activity.type === "certificate" ? "secondary" : "outline"
                  }
                  className="flex items-center gap-1"
                >
                  <IconComponent className="h-3 w-3" />
                  {activity.type === "inscription" && "Nouveau"}
                  {activity.type === "completion" && "Complété"}
                  {activity.type === "review" && "Avis"}
                  {activity.type === "certificate" && "Certificat"}
                </Badge>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
