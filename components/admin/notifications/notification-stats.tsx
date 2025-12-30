"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatCard } from "@/components/shared/stat-card"
import type { Notification } from "@/types/notifications"
import { Bell, AlertCircle, UserPlus, Megaphone, Shield } from "lucide-react"

type NotificationStatsProps = {
  notifications: Notification[]
}

export function NotificationStats({ notifications }: NotificationStatsProps) {
  const unreadCount = notifications.filter((n) => n.status === "unread").length
  const readCount = notifications.filter((n) => n.status === "read").length
  const archivedCount = notifications.filter((n) => n.status === "archived").length
  const moderationCount = notifications.filter((n) => n.type === "moderation" && n.status !== "archived").length
  const registrationCount = notifications.filter((n) => n.type === "registration" && n.status !== "archived").length
  const alertCount = notifications.filter((n) => n.type === "alert" && n.status !== "archived").length
  const announcementCount = notifications.filter((n) => n.type === "announcement" && n.status !== "archived").length

  const totalCount = notifications.length
  const readRate = totalCount > 0 ? ((readCount / totalCount) * 100).toFixed(1) : "0"

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      <Card className="border-[rgb(255,102,0)]/20 bg-gradient-to-br from-[rgb(255,102,0)]/5 to-transparent dark:from-[rgb(255,102,0)]/10">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[rgb(50,50,50)] dark:text-[rgb(150,150,150)] mb-1">
                Total notifications
              </p>
              <p className="text-3xl font-bold text-[rgb(0,0,0)] dark:text-[rgb(255,255,255)]">
                {totalCount}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-[rgb(255,102,0)]/20 dark:bg-[rgb(255,102,0)]/30 flex items-center justify-center">
              <Bell className="h-6 w-6 text-[rgb(255,102,0)]" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-[rgb(255,102,0)]/20 bg-gradient-to-br from-[rgb(255,102,0)]/5 to-transparent dark:from-[rgb(255,102,0)]/10">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[rgb(50,50,50)] dark:text-[rgb(150,150,150)] mb-1">
                Non lues
              </p>
              <p className="text-3xl font-bold text-[rgb(255,102,0)]">
                {unreadCount}
              </p>
              <p className="text-xs text-[rgb(50,50,50)] dark:text-[rgb(120,120,120)] mt-1">
                {readRate}% lues
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-[rgb(255,102,0)]/20 dark:bg-[rgb(255,102,0)]/30 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-[rgb(255,102,0)]" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-[rgb(255,102,0)]/20 bg-gradient-to-br from-[rgb(255,102,0)]/5 to-transparent dark:from-[rgb(255,102,0)]/10">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[rgb(50,50,50)] dark:text-[rgb(150,150,150)] mb-1">
                Modération
              </p>
              <p className="text-3xl font-bold text-[rgb(0,0,0)] dark:text-[rgb(255,255,255)]">
                {moderationCount}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-[rgb(255,102,0)]/20 dark:bg-[rgb(255,102,0)]/30 flex items-center justify-center">
              <Shield className="h-6 w-6 text-[rgb(255,102,0)]" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-[rgb(255,102,0)]/20 bg-gradient-to-br from-[rgb(255,102,0)]/5 to-transparent dark:from-[rgb(255,102,0)]/10">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[rgb(50,50,50)] dark:text-[rgb(150,150,150)] mb-1">
                Inscriptions
              </p>
              <p className="text-3xl font-bold text-[rgb(0,0,0)] dark:text-[rgb(255,255,255)]">
                {registrationCount}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-[rgb(255,102,0)]/20 dark:bg-[rgb(255,102,0)]/30 flex items-center justify-center">
              <UserPlus className="h-6 w-6 text-[rgb(255,102,0)]" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
