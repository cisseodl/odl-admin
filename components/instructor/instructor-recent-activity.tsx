"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { UserPlus, CheckCircle2, Star, Award, Clock, XCircle, BookOpen, FileText as FileTextIcon } from "lucide-react" // Ajout de BookOpen et FileTextIcon
import { useEffect, useState } from "react";
import { analyticsService, InstructorActivityDataPoint } from "@/services/analytics.service"; // Import analyticsService et InstructorActivityDataPoint
import { PageLoader } from "@/components/ui/page-loader";

interface InstructorRecentActivityProps {
  instructorId: number;
  limit?: number;
}

type ActivityDisplay = {
  id: number;
  user: string;
  avatar?: string;
  actionText: string; // Renamed from 'action' to avoid conflict with activityType in API
  resourceDisplay?: string;
  time: string;
  type: string; // activityType from API
  icon: any;
  iconColor: string;
}

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

const mapInstructorActivityToActivityDisplay = (activity: InstructorActivityDataPoint, index: number): ActivityDisplay => {
  let actionText: string = "";
  let icon: any = Clock;
  let iconColor: string = "text-muted-foreground";

  switch (activity.activityType) {
    case "COURSE_CREATED":
      actionText = "a créé la formation";
      icon = BookOpen;
      iconColor = "text-[hsl(var(--info))]";
      break;
    case "COURSE_UPDATED":
      actionText = "a mis à jour la formation";
      icon = BookOpen;
      iconColor = "text-[hsl(var(--warning))]";
      break;
    case "QUIZ_PUBLISHED":
      actionText = "a publié un quiz pour";
      icon = FileTextIcon;
      iconColor = "text-[hsl(var(--info))]";
      break;
    case "REVIEW_RESPONDED":
      actionText = "a répondu à un avis sur";
      icon = Star;
      iconColor = "text-[hsl(var(--success))]";
      break;
    case "CERTIFICATE_ISSUED":
      actionText = "a délivré un certificat pour";
      icon = Award;
      iconColor = "text-[hsl(var(--success))]";
      break;
    default:
      actionText = `a effectué l'action ${activity.activityType} sur`;
      break;
  }

  return {
    id: `${activity.activityType}-${activity.courseId || 'no-course'}-${activity.timestamp}-${index}`,
    user: "Vous", // Assuming the activity is by the instructor logged in, or can be dynamic
    avatar: "/placeholder-user.jpg", // Placeholder or fetch instructor's avatar
    actionText: actionText,
    resourceDisplay: activity.courseTitle || `Cours #${activity.courseId}`,
    time: formatTimeAgo(activity.timestamp),
    type: activity.activityType,
    icon: icon,
    iconColor: iconColor,
  };
};

export function InstructorRecentActivity({ instructorId, limit = 4 }: InstructorRecentActivityProps) {
  const [activities, setActivities] = useState<ActivityDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecentActivity = async () => {
      setLoading(true);
      setError(null);
      try {
        const fetchedActivities = await analyticsService.getInstructorActivity(instructorId, limit);
        const mappedActivities = fetchedActivities.map((activity, index) => mapInstructorActivityToActivityDisplay(activity, index));
        setActivities(mappedActivities);
      } catch (err: any) {
        setError(err.message || "Failed to fetch recent activity.");
        console.error("Error fetching instructor recent activity:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecentActivity();
  }, [instructorId, limit]);

  if (loading) {
    return <PageLoader />;
  }

  if (error) {
    return <div className="text-center text-destructive p-4">{error}</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Votre Activité Récente</CardTitle>
        <CardDescription>Vos dernières actions sur la plateforme</CardDescription>
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
                      <span className="text-muted-foreground">{activity.actionText}</span>{" "}
                      <span className="font-medium">{activity.resourceDisplay}</span>
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 leading-relaxed">
                      <Clock className="h-3 w-3" />
                      {activity.time}
                    </p>
                  </div>
                  <Badge
                    variant={
                      activity.type === "COURSE_CREATED" ? "default" : activity.type === "REVIEW_RESPONDED" ? "secondary" : "outline"
                    }
                    className="flex items-center gap-1"
                  >
                    <IconComponent className="h-3 w-3" />
                    {activity.type === "COURSE_CREATED" && "Création Cours"}
                    {activity.type === "COURSE_UPDATED" && "Mise à jour Cours"}
                    {activity.type === "QUIZ_PUBLISHED" && "Quiz Publié"}
                    {activity.type === "REVIEW_RESPONDED" && "Avis Répondu"}
                    {activity.type === "CERTIFICATE_ISSUED" && "Certificat Délivré"}
                    {/* Default case if type is not matched */}
                    {!["COURSE_CREATED", "COURSE_UPDATED", "QUIZ_PUBLISHED", "REVIEW_RESPONDED", "CERTIFICATE_ISSUED"].includes(activity.type) && activity.type}
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
