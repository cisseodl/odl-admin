import { NotificationsCenter } from "@/components/admin/notifications/notifications-center"
import { PageHeader } from "@/components/ui/page-header"

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="Gérez toutes vos notifications et alertes système"
      />
      <NotificationsCenter />
    </div>
  )
}

