import { CertificationsList } from "@/components/admin/certifications-list"

export default function CertificationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestion des Certifications</h1>
        <p className="text-muted-foreground">Gérez toutes les certifications de la plateforme</p>
      </div>
      <CertificationsList />
    </div>
  )
}

