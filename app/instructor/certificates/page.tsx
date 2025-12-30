import { CertificatesManager } from "@/components/instructor/certificates-manager"

export default function InstructorCertificatesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestion des Certificats</h1>
        <p className="text-muted-foreground">Gérez les certificats délivrés à vos apprenants</p>
      </div>
      <CertificatesManager />
    </div>
  )
}

