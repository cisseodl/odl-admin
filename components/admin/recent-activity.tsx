import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { UserPlus, CheckCircle2, Star, Award, Clock, XCircle } from "lucide-react" // Ajout de XCircle
import { useEffect, useState } from "react"; // Ajout de useEffect et useState
import { auditService } from "@/services"; // Import auditService
import { AuditLog, AuditAction, AuditResource } from "@/types/audit"; // Import types
import { PageLoader } from "@/components/ui/page-loader"; // Import PageLoader

interface RecentActivityProps {
  limit?: number; // Nombre d'activités à afficher, par défaut 4
}

type ActivityDisplay = {
  id: number;
  user: string;
  avatar?: string;
  action: string;
  resourceDisplay?: string; // Ex: Course title, user name, etc.
  time: string; // Formaté "Il y a X temps"
  type: string; // Ex: "inscription", "completion", "review", "certificate"
  icon: any; // Lucide icon component
  iconColor: string;
}

// Helper to format time (e.g., "5 minutes ago")
const formatTimeAgo = (timestamp: string): string => {
  const now = new Date();
  const date = new Date(timestamp);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return `${seconds} seconde${seconds > 1 ? "s" : ""} ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} heure${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  return `${days} jour${days > 1 ? "s" : ""} ago`;
};


// Helper to map AuditLog to ActivityDisplay
const mapAuditLogToActivityDisplay = (log: AuditLog): ActivityDisplay | null => {
  let actionText: string = "";
  let type: string = "";
  let icon: any = Clock; // Default icon
  let iconColor: string = "text-muted-foreground";
  let resourceDisplay: string = log.resourceName || log.resource || "N/A";


  switch (log.action) {
    case "create":
      actionText = "a créé";
      type = "creation";
      icon = UserPlus;
      iconColor = "text-[hsl(var(--info))]";
      if (log.resource === "course") actionText = "a créé la formation";
      if (log.resource === "user") actionText = "a créé le compte";
      break;
    case "update":
      actionText = "a mis à jour";
      type = "update";
      icon = CheckCircle2; // Ou un autre, à définir
      iconColor = "text-[hsl(var(--warning))]";
      if (log.resource === "course") actionText = "a mis à jour la formation";
      break;
    case "delete":
      actionText = "a supprimé";
      type = "deletion";
      icon = XCircle; // Icône de suppression
      iconColor = "text-destructive";
      break;
    case "approve":
      actionText = "a approuvé";
      type = "approval";
      icon = CheckCircle2;
      iconColor = "text-[hsl(var(--success))]";
      if (log.resource === "course") actionText = "a validé la formation";
      break;
    case "reject":
      actionText = "a rejeté";
      type = "rejection";
      icon = XCircle;
      iconColor = "text-destructive";
      if (log.resource === "course") actionText = "a rejeté la formation";
      break;
    case "login":
      actionText = "s'est connecté";
      type = "login";
      icon = UserPlus;
      iconColor = "text-[hsl(var(--info))]";
      resourceDisplay = ""; // Pas de ressource spécifique pour le login
      break;
    // ... Ajoutez d'autres cas si nécessaire
    default:
      actionText = `a effectué l'action ${log.action} sur`;
      type = "other";
      break;
  }
  
  if (log.resource === "course" && log.details && log.details.courseTitle) {
      resourceDisplay = log.details.courseTitle as string;
  } else if (log.resource === "user" && log.details && log.details.userName) {
      resourceDisplay = log.details.userName as string;
  }
  // Pour la concision, on peut ignorer certaines actions/ressources si trop verbeux ou non pertinent pour l'affichage général
  if (log.action === "view") return null; // Ignorer les vues

  return {
    id: log.id || 0,
    user: log.userName || "Utilisateur inconnu",
    avatar: "/placeholder-user.jpg", // Utiliser un avatar par défaut ou récupérer depuis les détails de l'utilisateur
    action: actionText,
    resourceDisplay: resourceDisplay,
    time: formatTimeAgo(log.createdAt),
    type: type,
    icon: icon,
    iconColor: iconColor,
  };
};


export function RecentActivity({ limit = 4 }: RecentActivityProps) {
  const [activities, setActivities] = useState<ActivityDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecentActivity = async () => {
      setLoading(true);
      setError(null);
      try {
        const fetchedLogs = await auditService.getRecentActivity(limit);
        const mappedActivities = fetchedLogs.map(mapAuditLogToActivityDisplay).filter(Boolean) as ActivityDisplay[];
        setActivities(mappedActivities);
      } catch (err: any) {
        setError(err.message || "Failed to fetch recent activity.");
        console.error("Error fetching recent activity:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecentActivity();
  }, [limit]); // Re-fetch quand la limite change

  if (loading) {
    return <PageLoader />;
  }

  if (error) {
    return <div className="text-center text-destructive p-4">{error}</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activité Récente</CardTitle>
        <CardDescription>Les dernières actions sur la plateforme</CardDescription>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center text-muted-foreground p-4">Aucune activité récente.</div>
        ) : (
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
                      <span className="font-medium">{activity.resourceDisplay}</span>
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
                    {activity.type === "approval" && "Approuvé"}
                    {activity.type === "rejection" && "Rejeté"}
                    {activity.type === "creation" && "Création"}
                    {activity.type === "update" && "Mise à jour"}
                    {activity.type === "login" && "Connexion"}
                    {activity.type === "deletion" && "Suppression"}
                  </Badge>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
