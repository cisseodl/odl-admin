"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { UserPlus, CheckCircle2, Star, Award, Clock, XCircle, BookOpen, FileText as FileTextIcon } from "lucide-react" // Ajout de BookOpen et FileTextIcon
import { useEffect, useState } from "react";
import { analyticsService, InstructorActivityDataPoint } from "@/services/analytics.service"; // Import analyticsService et InstructorActivityDataPoint
import { useLanguage } from "@/contexts/language-context"
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
  badgeText?: string;
}

const formatTimeAgo = (timestamp: string, t: (key: string, params?: any) => string): string => {
  const now = new Date();
  const date = new Date(timestamp);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) {
    const timeStr = t(`instructor.activity.time.seconds${seconds > 1 ? '_plural' : ''}`, { count: seconds });
    return t('instructor.activity.time.ago', { time: timeStr });
  }
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    const timeStr = t(`instructor.activity.time.minutes${minutes > 1 ? '_plural' : ''}`, { count: minutes });
    return t('instructor.activity.time.ago', { time: timeStr });
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    const timeStr = t(`instructor.activity.time.hours${hours > 1 ? '_plural' : ''}`, { count: hours });
    return t('instructor.activity.time.ago', { time: timeStr });
  }
  const days = Math.floor(hours / 24);
  const timeStr = t(`instructor.activity.time.days${days > 1 ? '_plural' : ''}`, { count: days });
  return t('instructor.activity.time.ago', { time: timeStr });
};

const mapInstructorActivityToActivityDisplay = (activity: InstructorActivityDataPoint, index: number, t: (key: string, params?: any) => string): ActivityDisplay => {
  let actionText: string = "";
  let icon: any = Clock;
  let iconColor: string = "text-muted-foreground";
  let badgeText: string = "";

  switch (activity.activityType) {
    case "COURSE_CREATED":
      actionText = t('instructor.activity.actions.course_created');
      badgeText = t('instructor.activity.badges.course_created');
      icon = BookOpen;
      iconColor = "text-[hsl(var(--info))]";
      break;
    case "COURSE_UPDATED":
      actionText = t('instructor.activity.actions.course_updated');
      badgeText = t('instructor.activity.badges.course_updated');
      icon = BookOpen;
      iconColor = "text-[hsl(var(--warning))]";
      break;
    case "QUIZ_PUBLISHED":
      actionText = t('instructor.activity.actions.quiz_published');
      badgeText = t('instructor.activity.badges.quiz_published');
      icon = FileTextIcon;
      iconColor = "text-[hsl(var(--info))]";
      break;
    case "REVIEW_RESPONDED":
      actionText = t('instructor.activity.actions.review_responded');
      badgeText = t('instructor.activity.badges.review_responded');
      icon = Star;
      iconColor = "text-[hsl(var(--success))]";
      break;
    case "CERTIFICATE_ISSUED":
      actionText = t('instructor.activity.actions.certificate_issued');
      badgeText = t('instructor.activity.badges.certificate_issued');
      icon = Award;
      iconColor = "text-[hsl(var(--success))]";
      break;
    default:
      actionText = t('instructor.activity.actions.unknown', { type: activity.activityType });
      badgeText = activity.activityType;
      break;
  }

  // Générer un avatar avec initiales (pas de photo d'humain)
  const userInitials = t('instructor.activity.you').slice(0, 2).toUpperCase()
  
  return {
    id: `${activity.activityType}-${activity.courseId || 'no-course'}-${activity.timestamp}-${index}`,
    user: t('instructor.activity.you'), // Traduit selon la langue
    avatar: undefined, // Pas d'image, on utilisera AvatarFallback avec initiales
    actionText: actionText,
    resourceDisplay: activity.courseTitle || `Cours #${activity.courseId}`,
    time: formatTimeAgo(activity.timestamp, t),
    type: activity.activityType,
    icon: icon,
    iconColor: iconColor,
    badgeText: badgeText,
  };
};

export function InstructorRecentActivity({ instructorId, limit = 4 }: InstructorRecentActivityProps) {
  const { t } = useLanguage()
  const [activities, setActivities] = useState<ActivityDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecentActivity = async () => {
      setLoading(true);
      setError(null);
      try {
        const fetchedActivities = await analyticsService.getInstructorActivity(instructorId, limit);
        const mappedActivities = fetchedActivities.map((activity, index) => mapInstructorActivityToActivityDisplay(activity, index, t));
        setActivities(mappedActivities);
      } catch (err: any) {
        setError(err.message || "Failed to fetch recent activity.");
        console.error("Error fetching instructor recent activity:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecentActivity();
  }, [instructorId, limit, t]);

  if (loading) {
    return <PageLoader />;
  }

  if (error) {
    return <div className="text-center text-destructive p-4">{error}</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('instructor.activity.title')}</CardTitle>
        <CardDescription>{t('instructor.activity.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center text-muted-foreground p-4">{t('instructor.activity.no_activity')}</div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => {
              const IconComponent = activity.icon
              return (
                <div key={activity.id} className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar>
                      {/* Ne pas utiliser d'image, seulement AvatarFallback avec initiales */}
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {activity.user.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
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
                    {activity.badgeText || activity.type}
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
