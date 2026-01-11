"use client"

import { useLanguage } from "@/contexts/language-context"
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
const formatTimeAgo = (timestamp: string, t: (key: string, params?: Record<string, number>) => string): string => {
  const now = new Date();
  const date = new Date(timestamp);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) {
    const key = seconds === 1 ? 'activity.time.seconds_ago' : 'activity.time.seconds_ago_plural';
    return t(key, { count: seconds });
  }
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    const key = minutes === 1 ? 'activity.time.minutes_ago' : 'activity.time.minutes_ago_plural';
    return t(key, { count: minutes });
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    const key = hours === 1 ? 'activity.time.hours_ago' : 'activity.time.hours_ago_plural';
    return t(key, { count: hours });
  }
  const days = Math.floor(hours / 24);
  const key = days === 1 ? 'activity.time.days_ago' : 'activity.time.days_ago_plural';
  return t(key, { count: days });
};


// Helper to map AuditLog to ActivityDisplay
const mapAuditLogToActivityDisplay = (log: AuditLog, t: (key: string) => string): ActivityDisplay | null => {
  let actionText: string = "";
  let type: string = "";
  let icon: any = Clock; // Default icon
  let iconColor: string = "text-muted-foreground";
  let resourceDisplay: string = log.resourceName || log.resource || "N/A";

  // Extraire le nom de la ressource depuis resourceName ou details
  if (log.resourceName && log.resourceName !== log.resource) {
    resourceDisplay = log.resourceName;
  } else if (log.details) {
    if (log.resource === "course" && log.details.courseTitle) {
      resourceDisplay = log.details.courseTitle as string;
    } else if (log.resource === "user" && log.details.userName) {
      resourceDisplay = log.details.userName as string;
    } else if (log.details.title) {
      resourceDisplay = log.details.title as string;
    } else if (log.details.name) {
      resourceDisplay = log.details.name as string;
    }
  }

  // Parser le resource si c'est au format "Type: Name"
  if (log.resource && log.resource.includes(":")) {
    const parts = log.resource.split(":");
    if (parts.length > 1 && resourceDisplay === log.resource) {
      resourceDisplay = parts[1].trim();
    }
  }

  switch (log.action) {
    case "create":
      actionText = t('activity.actions.created');
      type = "creation";
      icon = UserPlus;
      iconColor = "text-[hsl(var(--info))]";
      if (log.resource === "course" || log.resource?.startsWith("course")) actionText = t('activity.actions.created_course');
      if (log.resource === "user" || log.resource?.startsWith("user")) actionText = t('activity.actions.created_account');
      break;
    case "update":
      actionText = t('activity.actions.updated');
      type = "update";
      icon = CheckCircle2;
      iconColor = "text-[hsl(var(--warning))]";
      if (log.resource === "course" || log.resource?.startsWith("course")) actionText = t('activity.actions.updated_course');
      break;
    case "delete":
      actionText = t('activity.actions.deleted');
      type = "deletion";
      icon = XCircle;
      iconColor = "text-destructive";
      break;
    case "approve":
      actionText = t('activity.actions.approved');
      type = "approval";
      icon = CheckCircle2;
      iconColor = "text-[hsl(var(--success))]";
      if (log.resource === "course" || log.resource?.startsWith("course")) actionText = t('activity.actions.approved_course');
      break;
    case "reject":
      actionText = t('activity.actions.rejected');
      type = "rejection";
      icon = XCircle;
      iconColor = "text-destructive";
      if (log.resource === "course" || log.resource?.startsWith("course")) actionText = t('activity.actions.rejected_course');
      break;
    case "login":
      actionText = t('activity.actions.logged_in');
      type = "login";
      icon = UserPlus;
      iconColor = "text-[hsl(var(--info))]";
      resourceDisplay = ""; // Pas de ressource spécifique pour le login
      break;
    default:
      actionText = t('activity.actions.other', { action: log.action });
      type = "other";
      break;
  }
  
  // Pour la concision, on peut ignorer certaines actions/ressources si trop verbeux ou non pertinent pour l'affichage général
  if (log.action === "view") return null; // Ignorer les vues

  return {
    id: log.id || 0,
    user: log.userName || t('activity.unknown_user'),
    avatar: "/placeholder-user.jpg",
    action: actionText,
    resourceDisplay: resourceDisplay,
    time: formatTimeAgo(log.createdAt, t),
    type: type,
    icon: icon,
    iconColor: iconColor,
  };
};


export function RecentActivity({ limit = 4 }: RecentActivityProps) {
  const { t } = useLanguage()
  const [activities, setActivities] = useState<ActivityDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecentActivity = async () => {
      setLoading(true);
      setError(null);
      try {
        const fetchedLogs = await auditService.getRecentActivity(limit);
        const mappedActivities = fetchedLogs.map(log => mapAuditLogToActivityDisplay(log, t)).filter(Boolean) as ActivityDisplay[];
        setActivities(mappedActivities);
      } catch (err: any) {
        setError(err.message || t('activity.errors.fetch_failed'));
        console.error("Error fetching recent activity:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecentActivity();
  }, [limit, t]); // Re-fetch quand la limite change

  if (loading) {
    return <PageLoader />;
  }

  if (error) {
    return <div className="text-center text-destructive p-4">{error}</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('activity.title')}</CardTitle>
        <CardDescription>{t('activity.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center text-muted-foreground p-4">{t('activity.empty')}</div>
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
                    {activity.type === "inscription" && t('activity.badges.new')}
                    {activity.type === "completion" && t('activity.badges.completed')}
                    {activity.type === "review" && t('activity.badges.review')}
                    {activity.type === "certificate" && t('activity.badges.certificate')}
                    {activity.type === "approval" && t('activity.badges.approved')}
                    {activity.type === "rejection" && t('activity.badges.rejected')}
                    {activity.type === "creation" && t('activity.badges.creation')}
                    {activity.type === "update" && t('activity.badges.update')}
                    {activity.type === "login" && t('activity.badges.login')}
                    {activity.type === "deletion" && t('activity.badges.deletion')}
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
